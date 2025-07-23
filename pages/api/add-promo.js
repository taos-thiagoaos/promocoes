import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { Octokit } from '@octokit/rest';

const base64ToBuffer = (base64) => Buffer.from(base64.split(',')[1], 'base64');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = 'taos-thiagoaos';
  const repo = 'promocoes';

  try {
    const { title, text, link, image, startDate, endDate } = req.body;
    
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

    const promoData = {
      id: `promo-${Date.now()}`,
      title,
      date: startDate,
      text,
      link,
      imageUrl: `/images/anuncios/${imageName}`,
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

    existingJsonContent.push(promoData);

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonPath,
      message: `[BOT] Adiciona anúncio: ${title}`,
      content: Buffer.from(JSON.stringify(existingJsonContent, null, 2)).toString('base64'),
      sha: existingJsonSha,
      branch: 'main',
    });

    res.status(200).json({ message: 'Anúncio adicionado com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar anúncio no GitHub:', error);
    res.status(500).json({ error: 'Falha ao adicionar anúncio no GitHub.' });
  }
}  