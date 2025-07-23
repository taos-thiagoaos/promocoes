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

export const generateText = (title) => {
  return fetchApi('/api/generate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
};

export const optimizeRepoImage = (imageUrl) => {
  return fetchApi('/api/optimize-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
};

export const optimizeBase64Image = (base64Image) => {
  return fetchApi('/api/optimize-base64-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });
};

export const deletePromo = ({ id, date }) => {
  return fetchApi('/api/delete-promo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, date }),
  });
};

export const scrapeAmazonUrl = (url) => {
  return fetchApi('/api/scrape-amazon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
};