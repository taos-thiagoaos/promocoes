import { withAllowedUsers } from '@/pages/api/auth/auth-helpers';

async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey)
    return res.status(500).json({ error: 'A chave da API do Gemini não está configurada.' });
  if (!prompt) return res.status(400).json({ error: 'O prompt é obrigatório.' });

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
