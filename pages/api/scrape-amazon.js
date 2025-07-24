import * as cheerio from 'cheerio';
import { withAllowedUsers } from '../../lib/auth';

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type');
  return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
}

async function handler(req, res) {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('#productTitle').text().trim();
    
    let description = '';
    $('#feature-bullets ul li').each((i, el) => {
      description += $(el).text().trim() + '\n';
    });

    const imageUrl = $('#landingImage').attr('src');

    if (!title || !imageUrl) {
      return res.status(404).json({ error: 'Não foi possível extrair os dados. A estrutura da página da Amazon pode ter mudado.' });
    }

    const imageBase64 = await fetchImageAsBase64(imageUrl);

    res.status(200).json({
      title,
      description: description.trim(),
      image: imageBase64,
    });
  } catch (error) {
    console.error('Erro no scraping da Amazon:', error);
    res.status(500).json({ error: 'Falha ao buscar dados da Amazon.' });
  }
}

export default withAllowedUsers(handler);