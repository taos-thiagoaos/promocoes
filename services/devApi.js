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
 * Chama a API para atualizar o texto de uma promoção em seu arquivo JSON.
 * @param {{id: string, date: string, newText: string}} promoData Os dados da promoção a ser atualizada.
 * @returns {Promise<{message: string}>} A mensagem de sucesso.
 */
export const updatePromoText = ({ id, date, newText }) => {
  return fetchApi('/api/update-promo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, date, newText }),
  });
};

/**
 * Chama a API para otimizar a imagem de uma promoção.
 * @param {{imageUrl: string}} imageData O caminho da imagem.
 * @returns {Promise<{message: string}>} A mensagem de sucesso.
 */
export const optimizePromoImage = ({ imageUrl }) => {
  return fetchApi('/api/optimize-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
};