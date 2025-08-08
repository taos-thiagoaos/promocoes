import { useEffect, useState } from 'react';
import FlashDealAlertSingle from './FlashDealAlertSingle';

export default function FlashDealAlert({ anuncios }) {
  const [flashDeal, setFlashDeal] = useState(null);

  useEffect(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas
    const expiring = anuncios.find(
      (a) => a.expiresAt && new Date(a.expiresAt) > now && new Date(a.expiresAt) <= soon
    );
    setFlashDeal(expiring || null);
  }, [anuncios]);

  if (!flashDeal) return null;
  return <FlashDealAlertSingle promo={flashDeal} />;
}
