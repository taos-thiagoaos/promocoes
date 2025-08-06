import { withAllowedUsers } from '@/pages/api/auth/auth-helpers';
import sharp from 'sharp';
import { Octokit } from '@octokit/rest';

export async function handler(req, res) {
  const { imageUrl } = req.body; // ex: https://example.com/image.jpg ou /images/anuncios/123-abc.jpeg

  if (!imageUrl) {
    return res.status(400).json({ error: 'A URL da imagem é obrigatória.' });
  }

  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Token do GitHub não configurado.' });
  }

  try {
    // Configuração do Octokit
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    const owner = 'taos-thiagoaos';
    const repo = 'promocoes';

    // Determina se é URL completa ou relativa
    let fullImageUrl;
    if (imageUrl.startsWith('http')) {
      fullImageUrl = imageUrl;
    } else {
      // Se for URL relativa, constrói a URL completa do GitHub
      fullImageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/public${imageUrl}`;
    }

    console.log('Baixando imagem de:', fullImageUrl);

    // Baixa a imagem da internet
    const response = await fetch(fullImageUrl);
    if (!response.ok) {
      return res.status(404).json({ error: `Falha ao baixar a imagem: ${response.statusText}` });
    }

    const originalBuffer = Buffer.from(await response.arrayBuffer());
    const originalSize = originalBuffer.length;

    console.log('Tamanho original da imagem:', originalSize, 'bytes');

    // Otimiza a imagem com Sharp
    const optimizedBuffer = await sharp(originalBuffer)
      .resize({
        width: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
      .toBuffer();

    const optimizedSize = optimizedBuffer.length;
    const reduceSize = originalSize - optimizedSize;

    console.log('Tamanho otimizado:', optimizedSize, 'bytes');
    console.log('Redução de tamanho:', reduceSize, 'bytes');

    // Extrai o nome da imagem e cria novo nome com extensão .webp
    const imageName = imageUrl.split('/').pop();
    const imageNameWithoutExt = imageName.split('.')[0];
    const githubImagePath = `public/images/anuncios/${imageName}`;

    console.log('Atualizando imagem no GitHub:', githubImagePath);

    // Busca o SHA da imagem existente para poder atualizá-la
    let existingSha = null;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: githubImagePath,
      });
      existingSha = existingFile.sha;
      console.log('Imagem existente encontrada, SHA:', existingSha);
    } catch (error) {
      if (error.status !== 404) {
        console.error('Erro ao buscar imagem existente:', error);
        throw error;
      }
      console.log('Imagem não existe, será criada');
    }

    // Atualiza/cria a imagem otimizada no GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: githubImagePath,
      message: `[BOT] Otimiza imagem: ${imageName}`,
      content: optimizedBuffer.toString('base64'),
      sha: existingSha, // Se existir, será uma atualização; se não, será criação
      branch: 'main',
    });

    console.log('Imagem atualizada no GitHub com sucesso');

    // Converte para base64 data URL para retorno
    const optimizedImage = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;

    return res.status(200).json({
      optimizedImage,
      reduceSize,
    });
  } catch (error) {
    console.error('Erro ao otimizar a imagem:', error);
    return res.status(500).json({ error: `Falha ao otimizar a imagem: ${error.message}` });
  }
}

export default withAllowedUsers(handler);
