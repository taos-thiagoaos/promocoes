import { withAllowedUsers } from '@/lib/auth';
import { Octokit } from '@octokit/rest';
import { slugify } from '@/lib/helpers';

const base64ToBuffer = (base64) => Buffer.from(base64.split(',')[1], 'base64');

async function handler(req, res) {
  // Verifica se o token do GitHub está configurado
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Token do GitHub não configurado.' });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = 'taos-thiagoaos';
  const repo = 'promocoes';

  try {
    // Verifica se o repositório existe e se temos acesso
    try {
      const repoInfo = await octokit.repos.get({ owner, repo });
      console.log(`Repositório ${owner}/${repo} encontrado:`, repoInfo.data.name);
    } catch (repoError) {
      console.error('Erro ao acessar repositório:', repoError.message);
      
      // Tenta listar os repositórios do usuário para debug
      try {
        const { data: repos } = await octokit.repos.listForAuthenticatedUser();
        const repoNames = repos.map(r => r.name);
        console.log('Repositórios disponíveis:', repoNames);
        
        return res.status(500).json({ 
          error: `Repositório ${owner}/${repo} não encontrado. Repositórios disponíveis: ${repoNames.join(', ')}` 
        });
      } catch (listError) {
        return res.status(500).json({ 
          error: `Repositório ${owner}/${repo} não encontrado e não foi possível listar repositórios disponíveis.` 
        });
      }
    }

    const { title, text, link, image, startDate, coupon, id } = req.body;
    
    let finalImageUrl = req.body.imageUrl; // Para edições

    // Se for uma nova imagem (base64), faz o upload
    if (image) {
      try {
        console.log('Processando imagem base64...');
        
        const imageBuffer = base64ToBuffer(image);
        
        // Melhora a extração da extensão da imagem
        let imageExtension = 'jpeg'; // default
        const mimeTypeMatch = image.match(/data:image\/([^;]+)/);
        if (mimeTypeMatch) {
          imageExtension = mimeTypeMatch[1];
          if (imageExtension === 'jpg') imageExtension = 'jpeg';
        }
        
        console.log('Image extension detected:', imageExtension);
        
        const imageName = `${Date.now()}-${slugify(title.toLowerCase(), 30)}.${imageExtension}`;
        const imagePath = `public/images/anuncios/${imageName}`;

        console.log('Uploading image:', imageName);
        console.log('imagePath:', imagePath);
        console.log('Image buffer size:', imageBuffer.length, 'bytes');

        // Verifica se o diretório existe, se não, cria a estrutura
        try {
          await octokit.repos.getContent({
            owner,
            repo,
            path: 'public/images/anuncios',
          });
        } catch (dirError) {
          if (dirError.status === 404) {
            console.log('Diretório não existe, mas será criado automaticamente com o arquivo');
          }
        }

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: imagePath,
          message: `[BOT] Adiciona imagem para o anúncio: ${title}`,
          content: imageBuffer.toString('base64'),
          branch: 'main',
        });
        
        finalImageUrl = `/images/anuncios/${imageName}`;
        console.log('Imagem uploaded com sucesso:', finalImageUrl);
        
      } catch (imageError) {
        console.error('Erro ao fazer upload da imagem:', imageError);
        return res.status(500).json({ 
          error: `Falha ao fazer upload da imagem: ${imageError.message}` 
        });
      }
    }

    const promoData = {
      id: id || `promo-${Date.now()}`,
      title,
      date: startDate,
      text,
      link,
      imageUrl: finalImageUrl,
      coupon: coupon,
      store: 'Amazon',
    };

    console.log('promoData data:', promoData);

    const jsonFileName = `anuncios-${startDate}.json`;
    const jsonPath = `data/${jsonFileName}`;
    let existingJsonContent = [];
    let existingJsonSha = null;

    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: jsonPath,
      });
      existingJsonContent = JSON.parse(Buffer.from(data.content, 'base64').toString());
      existingJsonSha = data.sha;
      console.log('Arquivo JSON existente encontrado');
    } catch (error) {
      if (error.status !== 404) {
        console.error('Erro ao buscar arquivo JSON:', error);
        throw error;
      }
      console.log('Arquivo JSON não existe, será criado');
    }

    let updatedContent;
    // Se for uma edição, substitui o item existente
    if (id) {
      updatedContent = existingJsonContent.map(p => p.id === id ? promoData : p);
      console.log('Atualizando anúncio existente');
    } else {
      existingJsonContent.push(promoData);
      updatedContent = existingJsonContent;
      console.log('Adicionando novo anúncio');
    }

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: jsonPath,
        message: `[BOT] ${id ? 'Atualiza' : 'Adiciona'} anúncio: ${title}`,
        content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
        sha: existingJsonSha,
        branch: 'main',
      });
      
      console.log('Arquivo JSON salvo com sucesso');
    } catch (jsonError) {
      console.error('Erro ao salvar arquivo JSON:', jsonError);
      return res.status(500).json({ 
        error: `Falha ao salvar dados do anúncio: ${jsonError.message}` 
      });
    }

    res.status(200).json({ message: `Anúncio ${id ? 'atualizado' : 'adicionado'} com sucesso!` });
  } catch (error) {
    console.error('Erro no GitHub:', error);
    
    // Tratamento específico de erros
    if (error.status === 404) {
      res.status(500).json({ 
        error: 'Repositório não encontrado ou sem permissão de acesso. Verifique o nome do repositório e as permissões do token.' 
      });
    } else if (error.status === 401) {
      res.status(500).json({ 
        error: 'Token do GitHub inválido ou sem permissões necessárias.' 
      });
    } else if (error.status === 403) {
      res.status(500).json({ 
        error: 'Acesso negado. Verifique se o token tem permissões de escrita no repositório.' 
      });
    } else {
      res.status(500).json({ 
        error: `Falha na operação com o GitHub: ${error.message}` 
      });
    }
  }
}

export default withAllowedUsers(handler);