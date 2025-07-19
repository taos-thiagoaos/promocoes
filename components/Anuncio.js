import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isDev } from '../lib/helpers';
import { DATE_FORMAT, SITE_URL } from '../config';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Anuncio({ promo, isDetailPage = false }) {
  const [formattedDate, setFormattedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(promo.date), DATE_FORMAT, { locale: ptBR }));
    } catch (e) {
      console.error("Data inválida:", promo.date);
      setFormattedDate(promo.date);
    }
  }, [promo.date]);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Impede que o clique no botão de compartilhar acione o link do título
    const pageUrl = `${SITE_URL}/anuncios/${promo.date}/${promo.slug}`;
    if (navigator.share) {
      navigator.share({
        title: promo.title,
        text: `Confira esta promoção: ${promo.title}`,
        url: pageUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(pageUrl);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleCouponCopy = (coupon, event) => {
    try {
      navigator.clipboard.writeText(coupon);
      const targetButton = event.target;
      const originalText = targetButton.innerText;
      targetButton.innerText = 'Copiado!';
      setTimeout(() => {
        targetButton.innerText = originalText;
      }, 2000);
    } catch (err) {
      console.error('Falha ao copiar cupom: ', err);
    }
  };

  const handleGenerateText = async () => {
    setIsLoading(true);
    setGeneratedText('');
    setError('');
    setUpdateSuccess('');

    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: promo.title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro desconhecido');
      setGeneratedText(data.text);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceText = async () => {
    setIsLoading(true);
    setError('');
    setUpdateSuccess('');

    try {
      const response = await fetch('/api/update-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promo.id, date: promo.date, newText: generatedText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao atualizar arquivo.');
      setUpdateSuccess(data.message);
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeImage = async () => {
    setIsLoading(true);
    setError('');
    setUpdateSuccess('');
    try {
      const response = await fetch('/api/optimize-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: promo.imageUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao otimizar imagem.');
      setUpdateSuccess(data.message);
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createMarkup = (text) => ({ __html: text ? text.replace(/\n/g, '<br />') : '' });

  const TitleComponent = isDetailPage ? 'h1' : 'h2';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-8 transition-shadow duration-300 hover:shadow-2xl relative">
      <button onClick={handleShare} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition z-10" title="Compartilhar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
        </svg>
      </button>
      <div className="md:w-64 lg:w-72 md:flex-shrink-0 flex items-center justify-center bg-surface-200 rounded-l-xl">
        <img className="h-full w-full object-contain p-2" src={`${basePath}${promo.imageUrl}`} alt={`Imagem de ${promo.title}`} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/800x600/ef4444/ffffff?text=Imagem+Indisponível'; }} />
      </div>
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="uppercase tracking-wide text-sm text-brand-primary font-semibold">{promo.store}</div>
          <Link href={`/anuncios/${promo.date}/${promo.slug}`} className="pr-10">
            <TitleComponent className="block mt-1 text-2xl leading-tight font-bold text-black hover:underline">
              {promo.title}
            </TitleComponent>
          </Link>
          <p className="mt-2 text-gray-600" dangerouslySetInnerHTML={createMarkup(promo.text)} />
          {formattedDate && (
            <p className="mt-4 text-sm text-gray-500">
              Publicado em: {formattedDate}
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            {promo.coupon && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">CUPOM:</span>
                <button 
                  onClick={(e) => handleCouponCopy(promo.coupon, e)}
                  className="bg-yellow-200 text-yellow-800 font-mono font-bold py-2 px-4 rounded-lg border-2 border-dashed border-yellow-500 hover:bg-yellow-300"
                  title="Clique para copiar"
                >
                  {promo.coupon}
                </button>
              </div>
            )}
            <a href={promo.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Ver Promoção
            </a>
            {isDev && (
              <>
                <button onClick={handleGenerateText} disabled={isLoading} className="btn btn-secondary flex items-center justify-center gap-2 disabled:opacity-50">
                  ✨ {isLoading ? 'Gerando...' : 'Gerar Texto'}
                </button>
                <button onClick={handleOptimizeImage} disabled={isLoading} className="btn btn-secondary flex items-center justify-center gap-2 disabled:opacity-50">
                  🔧 {isLoading ? 'Otimizando...' : 'Otimizar Imagem'}
                </button>
              </>
            )}
          </div>

          {isDev && generatedText && (
            <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800">✨ Sugestão de Texto Gerado por IA:</h4>
              <p className="mt-2 text-slate-700" dangerouslySetInnerHTML={createMarkup(generatedText)} />
              <button onClick={handleReplaceText} disabled={isLoading} className="btn btn-success mt-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                💾 {isLoading ? 'Salvando...' : 'Salvar Texto no Arquivo'}
              </button>
            </div>
          )}
          {isDev && error && <p className="mt-2 text-sm text-red-600 font-bold">{error}</p>}
          {isDev && updateSuccess && <p className="mt-2 text-sm text-green-600 font-bold">{updateSuccess}</p>}
        </div>
      </div>
    </div>
  );
}