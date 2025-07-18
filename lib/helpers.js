export const isDev = process.env.NODE_ENV === 'development';

/**
 * Converte um texto para um formato de slug amigável para URL.
 * @param {string} text O texto a ser convertido.
 * @returns {string} O texto formatado como slug.
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .substring(0, 75);
}