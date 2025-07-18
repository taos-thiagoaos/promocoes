// pages/api/generate-text.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Esta rota só deve funcionar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not Found' });
  }

  const { title, text } = req.body;
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'A chave da API do Gemini não está configurada no arquivo .env.local' });
  }

  if (!title) {
    return res.status(400).json({ error: 'O título do produto é obrigatório.' });
  }

  const promptPartWithCurrentText = (text) 
    ? `O texto atual é: '${text}', a sua sugestão não deve ser uma cópia do texto atual, mas sim uma versão melhorada.`
    : "";

  const prompt = `Você é um especialista em marketing para blogs de promoções. 
    Crie um texto curto e persuasivo para um post de blog sobre o seguinte produto: '${title}'. 
    ${promptPartWithCurrentText}
    O texto deve ser otimizado para SEO, com foco em conversão, e deve incluir palavras-chave relevantes. 
    Use uma linguagem envolvente e amigável, destacando os benefícios do produto e incentivando a ação do usuário.
    Use emojis para deixar o texto mais atrativo, quebre as linhas, se necessário, para melhor legibilidade e crie um senso de urgência.
    Não inclua o link do produto no texto.
    Para formatação, use apenas as tags HTML <strong> para negrito e <em> para itálico. Para quebras de linha, use a tag <br>. 
    Nunca use mais de uma quebra de linha consecutiva para o texto não ficar muito espaçado. Não quero nada muito verticalizado.
    O texto deve ter no máximo 100.
    De preferência use alguns dot points, com emojis no lugar dos pontos, para listar os benefícios do produto.
    O resultado final deve ser só a sugestão, não coloque nada antes ou depois do texto, nem mesmo dizendo que entendeu o pedido ou que está gerando o texto.
    `;

  try {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error("API Error Body:", errorBody);
      throw new Error(`Erro na API do Gemini: ${apiResponse.statusText}`);
    }

    const result = await apiResponse.json();

    if (result.candidates && result.candidates.length > 0) {
      const text = result.candidates[0].content.parts[0].text;
      return res.status(200).json({ text });
    } else {
      throw new Error("Resposta da API inválida ou vazia.");
    }
  } catch (error) {
    console.error("Erro interno ao chamar a API do Gemini:", error);
    return res.status(500).json({ error: error.message });
  }
}