import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const isDev = process.env.NODE_ENV === 'development';

export default function Anuncio({ promo }) {
  const [formattedDate, setFormattedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(promo.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }));
    } catch (e) {
      console.error("Data inválida:", promo.date);
      setFormattedDate(promo.date);
    }
  }, [promo.date]);

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
        body: JSON.stringify({ title: promo.title, text: promo.text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      setGeneratedText(data.text);
    } catch (e) {
      console.error("Erro ao gerar texto com IA:", e);
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
        body: JSON.stringify({ 
          id: promo.id, 
          date: promo.date,
          newText: generatedText 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar arquivo.');
      }
      
      setUpdateSuccess(data.message);
      // Opcional: recarregar a página para ver a mudança refletida se a fonte de dados for lida novamente.
      // window.location.reload();
    } catch (e) {
      console.error("Erro ao substituir texto:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createMarkup = (text) => {
    return { __html: text.replace(/\n/g, '<br />') };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-8 transition-shadow duration-300 hover:shadow-2xl">
      <div className="md:w-64 lg:w-72 md:flex-shrink-0 flex items-center justify-center bg-surface-200 rounded-l-xl">
        <img className="h-full w-full object-contain p-2" src={`${basePath}${promo.imageUrl}`} alt={`Imagem de ${promo.title}`} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/800x600/ef4444/ffffff?text=Imagem+Indisponível'; }} />
      </div>
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="uppercase tracking-wide text-sm text-brand-primary font-semibold">{promo.store}</div>
          <a href={promo.link} target="_blank" rel="noopener noreferrer">
            <h2 className="block mt-1 text-2xl leading-tight font-bold text-black hover:underline">{promo.title}</h2>
          </a>
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
            {/* Botão de IA visível apenas em desenvolvimento */}
            {isDev && (
              <button onClick={handleGenerateText} disabled={isLoading} className="btn btn-secondary flex items-center justify-center gap-2 disabled:opacity-50">
                ✨ {isLoading ? 'Gerando...' : 'Gerar Texto com IA'}
              </button>
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