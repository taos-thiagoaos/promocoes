/**
 * Função genérica para fazer chamadas de API.
 * @param {string} endpoint O endpoint da API.
 * @param {object} options As opções para o fetch.
 * @returns {Promise<object>} Os dados da resposta da API.
 */
async function fetchApi(endpoint, options) {
  const response = await fetch(endpoint, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Ocorreu um erro na API.');
  }
  return data;
}

/**
 * Chama a API para gerar um texto de marketing para um produto.
 * @param {string} title O título do produto.
 * @returns {Promise<{text: string}>} O texto gerado.
 */
export const generateText = (title) => {
  return fetchApi('/api/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
};

/**
 * Chama a API para otimizar uma imagem já existente no repositório.
 * @param {{imageUrl: string}} imageData O caminho da imagem.
 * @returns {Promise<{message: string}>} A mensagem de sucesso.
 */
export const optimizeRepoImage = ({ imageUrl }) => {
  return fetchApi('/api/optimize-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
};

/**
 * Chama a API para otimizar uma imagem em formato base64.
 * @param {string} base64Image A imagem em base64.
 * @returns {Promise<{optimizedImage: string}>} A imagem otimizada em base64.
 */
export const optimizeBase64Image = (base64Image) => {
  return fetchApi('/api/optimize-base64-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });
};