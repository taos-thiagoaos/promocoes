import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../components/Header';
import Anuncio from '../../../components/Anuncio';
import Sidebar from '../../../components/Sidebar';
import { getAllPromos, getPromoBySlug, getSuggestedPromos, getFixedLinks, getFixedAnuncios, getAboutData, getAllStores } from '../../../lib/api';
import { SITE_URL, SITE_TITLE } from '../../../config';
import { AnuncioModel } from '../../../models/AnuncioModel';

export default function AnuncioPage({ promo: promoData, suggested: suggestedData, fixedLinks, fixedAnuncios, aboutData, stores }) {
  
  const promo = useMemo(() => promoData ? new AnuncioModel(promoData) : null, [promoData]);
  const suggested = useMemo(() => suggestedData.map(s => new AnuncioModel(s)), [suggestedData]);

  if (!promo) {
    return <div>Anúncio não encontrado.</div>;
  }

  const pageTitle = `${promo.title} | ${SITE_TITLE}`;
  const imageUrl = `${SITE_URL}${promo.imageUrl}`;

  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={promo.text.substring(0, 155)} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={promo.text.substring(0, 155)} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={promo.shareUrl} />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>
      <Header title={aboutData.title} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-3/4">
            <Anuncio promo={promo} isDetailPage={true} />
            {suggested && suggested.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6 border-b pb-4">Veja também</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggested.map(s => (
                    <Link key={s.id} href={s.internalLink} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                      <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${s.imageUrl}`} alt={s.title} className="h-48 w-full object-contain p-2 bg-surface-200" />
                      <div className="p-4">
                        <h3 className="font-bold text-lg">{s.title}</h3>
                        <span className="text-sm text-brand-primary mt-2 inline-block">Ver oferta &rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Sidebar links={fixedLinks} anuncios={fixedAnuncios} stores={stores} />
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const promos = getAllPromos();
  const paths = promos.map(promo => ({
    params: {
      date: promo.date,
      slug: promo.slug,
    },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const promo = getPromoBySlug(params.date, params.slug);
  if (!promo) {
    return { notFound: true };
  }
  
  const suggested = getSuggestedPromos(promo.id);

  return {
    props: {
      promo: JSON.parse(JSON.stringify(promo)),
      suggested: JSON.parse(JSON.stringify(suggested)),
      fixedLinks: getFixedLinks(),
      fixedAnuncios: getFixedAnuncios(),
      aboutData: getAboutData(),
      stores: getAllStores(),
    },
  };
}