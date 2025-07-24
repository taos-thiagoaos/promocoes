import { withAllowedUsers } from '../../lib/auth';
import { Octokit } from '@octokit/rest';

const base64ToBuffer = (base64) => Buffer.from(base64.split(',')[1], 'base64');

async function handler(req, res) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = 'taos-thiagoaos';
  const repo = 'promocoes';

  try {
    const { title, text, link, image, startDate, endDate, id } = req.body;
    
    let finalImageUrl = req.body.imageUrl; // Para edições

    // Se for uma nova imagem (base64), faz o upload
    if (image) {
      const imageBuffer = base64ToBuffer(image);
      const imageExtension = image.substring(image.indexOf('/') + 1, image.indexOf(';'));
      const imageName = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}.${imageExtension}`;
      const imagePath = `public/images/anuncios/${imageName}`;

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: imagePath,
        message: `[BOT] Adiciona imagem para o anúncio: ${title}`,
        content: imageBuffer.toString('base64'),
        branch: 'main',
      });
      finalImageUrl = `/images/anuncios/${imageName}`;
    }

    const promoData = {
      id: id || `promo-${Date.now()}`,
      title,
      date: startDate,
      text,
      link,
      imageUrl: finalImageUrl,
      coupon: null,
      store: 'Amazon',
      endDate,
    };

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
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    let updatedContent;
    // Se for uma edição, substitui o item existente
    if (id) {
      updatedContent = existingJsonContent.map(p => p.id === id ? promoData : p);
    } else {
      existingJsonContent.push(promoData);
      updatedContent = existingJsonContent;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonPath,
      message: `[BOT] ${id ? 'Atualiza' : 'Adiciona'} anúncio: ${title}`,
      content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
      sha: existingJsonSha,
      branch: 'main',
    });

    res.status(200).json({ message: `Anúncio ${id ? 'atualizado' : 'adicionado'} com sucesso!` });
  } catch (error) {
    console.error('Erro no GitHub:', error);
    res.status(500).json({ error: 'Falha na operação com o GitHub.' });
  }
}

export default withAllowedUsers(handler);