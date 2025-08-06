export const isDev = process.env.NODE_ENV === 'development';

/**
 * Converte um texto para um formato de slug amigável para URL.
 * @param {string} text O texto a ser convertido.
 * @returns {string} O texto formatado como slug.
 */
export function slugify(text, size = 75) {
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
    .substring(0, size);
}

export const htmlToTextFormat = (html) => {
  let text = html
    .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
    .replace(/<b>(.*?)<\/b>/gi, '*$1*')
    .replace(/<em>(.*?)<\/em>/gi, '_$1_')
    .replace(/<i>(.*?)<\/i>/gi, '_$1_')
    .replace(/<u>(.*?)<\/u>/gi, '~$1~')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, ''); // Remove outras tags
  return text;
};
