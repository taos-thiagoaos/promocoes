import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function Anuncio({ promo }) {
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-8 transition-shadow duration-300 hover:shadow-2xl">
      <div className="md:w-64 lg:w-72 md:flex-shrink-0">
        <img className="h-full w-full object-cover" src={promo.imageUrl} alt={`Imagem de ${promo.title}`} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/800x600/ef4444/ffffff?text=Imagem+Indisponível'; }} />
      </div>
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="uppercase tracking-wide text-sm text-brand-primary font-semibold">{promo.store}</div>
          <a href={promo.link} target="_blank" rel="noopener noreferrer">
            <h2 className="block mt-1 text-2xl leading-tight font-bold text-black hover:underline">{promo.title}</h2>
          </a>
          <p className="mt-2 text-gray-600 whitespace-pre-wrap">{promo.text}</p>
          <p className="mt-4 text-sm text-gray-500">
            Publicado em: {format(new Date(promo.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
          <a href={promo.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full sm:w-auto">
            Ver Promoção
          </a>
        </div>
      </div>
    </div>
  );
}