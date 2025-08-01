import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DATE_FORMAT } from '../config';
import { generateText, optimizeRepoImage, optimizeBase64Image, deletePromo } from '../services/adminApi';

export default function Anuncio({ promo, isDetailPage = false, isPreview = false, onUpdatePreview, onEdit }) {
  const { data: session } = useSession();
  const [formattedDate, setFormattedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    try {
      if (promo.date) {
        setFormattedDate(format(new Date(promo.date), DATE_FORMAT, { locale: ptBR }));
      }
    } catch (e) {
      console.error("Data inválida:", promo.date);
      setFormattedDate(promo.date);
    }
  }, [promo.date]);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: promo.title,
        text: `Confira esta promoção: ${promo.title}`,
        url: promo.shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(promo.shareUrl);
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
    setError('');
    setUpdateSuccess('');
    try {
      const data = await generateText(promo.title);
      setGeneratedText(data.text);
      if (isPreview) {
        onUpdatePreview({ text: data.text });
      }
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
      let message;

      console.log("Otimização de imagem iniciada:", promo);

      if (promo.imageUrl.startsWith('data:')) {
        const data = await optimizeBase64Image(promo.imageUrl);
        onUpdatePreview({ imageUrl: data.optimizedImage });
        message = "Imagem da pré-visualização otimizada!";
      } else {
        const data = await optimizeRepoImage(promo.imageUrl);
        message = data.message;
        setTimeout(() => window.location.reload(), 1500);
      }
      setUpdateSuccess(message);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja apagar o anúncio "${promo.title}"?`)) {
      setIsLoading(true);
      setError('');
      setUpdateSuccess('');
      try {
        await deletePromo({ id: promo.id, date: promo.date });
        setUpdateSuccess('Anúncio apagado com sucesso! A página será recarregada.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const createMarkup = (text) => ({ __html: text ? text.replace(/\n/g, '<br />') : '' });
  const TitleComponent = isDetailPage ? 'h1' : 'h2';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-8 transition-shadow duration-300 hover:shadow-2xl relative">
      {!isPreview && (
        <button onClick={handleShare} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition z-10" title="Compartilhar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/></svg>
        </button>
      )}
      <div className="md:w-64 lg:w-72 md:flex-shrink-0 flex items-center justify-center bg-surface-200 rounded-l-xl">
        <img className="h-full w-full object-contain p-2" src={promo.imageUrl} alt={`Imagem de ${promo.title}`} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/800x600/ef4444/ffffff?text=Imagem+Indisponível'; }} />
      </div>
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="uppercase tracking-wide text-sm text-brand-primary font-semibold">{promo.store || 'Loja'}</div>
          {isPreview ? (
            <TitleComponent className="block mt-1 text-2xl leading-tight font-bold text-black pr-10">{promo.title}</TitleComponent>
          ) : (
            <Link href={promo.internalLink} className="pr-10">
              <TitleComponent className="block mt-1 text-2xl leading-tight font-bold text-black hover:underline">
                {promo.title}
              </TitleComponent>
            </Link>
          )}
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
            {session && !isPreview && (
              <>
                <Link href={`/admin?edit=${promo.id}&date=${promo.date}`} className="btn btn-secondary">Editar</Link>
                <button onClick={handleDelete} disabled={isLoading} className="btn btn-danger">Apagar</button>
              </>
            )}
            {session && isPreview && (
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
          {session && error && <p className="mt-2 text-sm text-red-600 font-bold">{error}</p>}
          {session && updateSuccess && <p className="mt-2 text-sm text-green-600 font-bold">{updateSuccess}</p>}
        </div>
      </div>
    </div>
  );
}