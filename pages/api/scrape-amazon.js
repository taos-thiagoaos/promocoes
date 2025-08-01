

import * as cheerio from 'cheerio';
import { withAllowedUsers } from '@/pages/api/auth/auth-helpers';
import { isDev } from '@/lib/helpers';
import { fetch, Agent, setGlobalDispatcher } from 'undici';

// Ignora SSL apenas em desenvolvimento para fetch do Node.js
if (isDev) {
  setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
}

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
    console.log(`Fetching data from: ${url}`);
    
    // Headers mais completos para simular um browser real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };
    
    let response = await fetch(url, { headers });

    let htmlAmazonResponseText = await response.text();

    // Verifica se caiu na página de verificação da Amazon
    const isVerificationPage = htmlAmazonResponseText.includes('Clique no botão abaixo para continuar comprando') || 
                               htmlAmazonResponseText.includes('/errors/validateCaptcha') ||
                               htmlAmazonResponseText.includes('opfcaptcha.amazon.com') ||
                               htmlAmazonResponseText.includes('automated access');
    
    if (isVerificationPage) {
      
      console.log('Detected Amazon verification page, attempting to bypass...');
      
      // Carrega o HTML da página de verificação
      const $verify = cheerio.load(htmlAmazonResponseText);
      
      // Extrai os dados do formulário
      const form = $verify('form[action="/errors/validateCaptcha"]');
      const amznToken = form.find('input[name="amzn"]').attr('value');
      const amznR = form.find('input[name="amzn-r"]').attr('value');
      const fieldKeywords = form.find('input[name="field-keywords"]').attr('value');
      
      if (amznToken && amznR) {
        // Constrói a URL de bypass
        const bypassUrl = `https://www.amazon.com.br/errors/validateCaptcha?amzn=${encodeURIComponent(amznToken)}&amzn-r=${encodeURIComponent(amznR)}&field-keywords=${encodeURIComponent(fieldKeywords || '')}`;
        
        console.log(`Attempting to bypass with URL: ${bypassUrl}`);
        
        // Faz uma nova requisição para o endpoint de validação
        response = await fetch(bypassUrl, {
          headers: {
            ...headers,
            'Referer': url
          }
        });
        
        htmlAmazonResponseText = await response.text();
        console.log('Bypass attempt completed');
      } else {
        console.log('Could not extract form data from verification page');
      }
    }

    const $ = cheerio.load(htmlAmazonResponseText);

    console.log('Cheerio loaded successfully');

    const title = $('#productTitle').text().trim();
    
    let description = '';
    $('#feature-bullets ul li').each((i, el) => {
      description += $(el).text().trim() + '\n';
    });

    const imageUrl = $('#landingImage').attr('src');

    // Verifica se ainda estamos na página de verificação após tentativa de bypass
    const stillBlocked = htmlAmazonResponseText.includes('Clique no botão abaixo para continuar comprando') ||
                         htmlAmazonResponseText.includes('opfcaptcha.amazon.com') ||
                         htmlAmazonResponseText.includes('automated access');
                         
    if (stillBlocked) {
      return res.status(403).json({ 
        error: 'Amazon está bloqueando o acesso automatizado. Tente novamente mais tarde ou use uma VPN.' 
      });
    }

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