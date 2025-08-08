import Link from 'next/link';

export default function FlashDealAlertSingle({ promo }) {
  if (!promo || !promo.expiresAt) return null;
  const now = new Date();
  const expires = new Date(promo.expiresAt);
  const soon = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  if (expires <= now || expires > soon) return null;

  return (
    <div className="w-full bg-yellow-400 text-black text-center py-4 shadow-xl">
      <span className="font-bold">⚡ Oferta Relâmpago! </span>
      <span>
        {promo.title} termina em {formatTimeLeft(promo.expiresAt)}!
      </span>
      <Link
        href={promo.link}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition"
      >
        Ver Oferta Relâmpago
      </Link>
    </div>
  );
}

function formatTimeLeft(expiresAt) {
  const now = new Date();
  const end = new Date(expiresAt);
  const diff = Math.max(0, end - now);
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const minLeft = min % 60;
  if (hr > 0) return `${hr}h ${minLeft}min`;
  return `${minLeft}min`;
}
