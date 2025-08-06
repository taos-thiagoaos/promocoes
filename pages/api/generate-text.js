import { withAllowedUsers } from '@/pages/api/auth/auth-helpers';

async function handler(req, res) {
  const { title } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey)
    return res.status(500).json({ error: 'A chave da API do Gemini não está configurada.' });
  if (!title) return res.status(400).json({ error: 'O título do produto é obrigatório.' });

  const prompt = `Você é um especialista em marketing para blogs de promoções. Crie um texto curto e persuasivo para um post de blog sobre o seguinte produto: '${title}'. Use emojis para deixar o texto mais atrativo. Para formatação, use apenas as tags HTML <strong> para negrito e <em> para itálico. Para quebras de linha, use a tag <br>. Crie um senso de urgência e não inclua o link do produto no texto.`;

  try {
    const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      throw new Error(`Erro na API do Gemini: ${apiResponse.statusText} - ${errorBody}`);
    }

    const result = await apiResponse.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      return res.status(200).json({ text });
    } else {
      throw new Error('Resposta da API inválida ou vazia.');
    }
  } catch (error) {
    console.error('Erro interno ao chamar a API do Gemini:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAllowedUsers(handler);
