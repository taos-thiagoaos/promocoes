import { slugify, htmlToTextFormat } from '@/lib/helpers';
import { SITE_URL } from '../config';

/**
 * Representa um anúncio, encapsulando os dados e lógicas relacionadas.
 */
export class AnuncioModel {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.date = data.date;
    this.text = data.text;
    this.link = data.link;
    this.imageUrl = data.imageUrl;
    this.coupon = data.coupon;
    this.store = data.store;
    this.slug = data.slug || slugify(this.title);
  }

  /**
   * Retorna o link interno para a página de detalhes do anúncio.
   * @returns {string} O link interno.
   */
  get internalLink() {
    return `/anuncios/${this.date}/${this.slug}`;
  }

  /**
   * Retorna a URL completa para compartilhamento.
   * @returns {string} A URL completa.
   */
  get shareUrl() {
    return `${SITE_URL}${this.internalLink}`;
  }

  /**
   * Retorna a URL completa da imagem para compartilhamento.
   * @returns {string} A URL completa.
   */
  get shareImageUrl() {
    return `${SITE_URL}${this.imageUrl}`;
  }

  get shareNavitatorMessage() {
    const formattedText = htmlToTextFormat(this.text);
    return `\n${formattedText}\n\nAcesse na loja ${this.store}: ${this.link}`;
  }

  get shareClipboardMessage() {
    const formattedText = htmlToTextFormat(this.text);
    return `${this.title}\n\n${formattedText}\n\nAcesse na loja ${this.store}: ${this.link}\nOu no nosso site: ${this.shareUrl}`;
  }
}
