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
    .replace(/\s+/g, '-')           // Substitui espaços por -
    .replace(/[^\w\-]+/g, '')       // Remove todos os caracteres não-alfanuméricos
    .replace(/\-\-+/g, '-')         // Substitui múltiplos - por um único -
    .replace(/^-+/, '')             // Remove - do início
    .replace(/-+$/, '')             // Remove - do fim
    .substring(0, 75);              // Limita o slug a 75 caracteres
}
