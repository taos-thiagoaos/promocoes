import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function Anuncio({ promo }) {
  const [formattedDate, setFormattedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState('');

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

    const prompt = `Você é um especialista em marketing para blogs de promoções. Crie um texto curto e persuasivo para um post de blog sobre o seguinte produto: '${promo.title}'. Use emojis para deixar o texto mais atrativo, quebre as linhas para melhor legibilidade e crie um senso de urgência. Não inclua o link do produto no texto.`;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedText(text);
      } else {
        throw new Error("Resposta da API inválida ou vazia.");
      }

    } catch (e) {
      console.error("Erro ao gerar texto com IA:", e);
      setError("Não foi possível gerar o texto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyGeneratedText = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Texto copiado para a área de transferência!');
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
          <p className="mt-2 text-gray-600 whitespace-pre-wrap">{promo.text}</p>
          {formattedDate && (
            <p className="mt-4 text-sm text-gray-500">
              Publicado em: {formattedDate}
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            <button onClick={handleGenerateText} disabled={isLoading} className="btn btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50">
              ✨ {isLoading ? 'Gerando...' : 'Gerar Texto com IA'}
            </button>
          </div>

          {generatedText && (
            <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800">✨ Sugestão de Texto Gerado por IA:</h4>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">{generatedText}</p>
              <button onClick={copyGeneratedText} className="mt-3 text-sm font-bold text-brand-primary hover:underline">Copiar Texto</button>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}