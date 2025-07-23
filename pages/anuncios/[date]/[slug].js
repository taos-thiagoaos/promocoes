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
      <main className="container mx-auto p-4">
        <Anuncio promo={anuncio} isDetailPage={true} onEdit={handleEdit} />

        <div className="mt-8 text-center">
          <Link href="/" className="btn btn-secondary">
            Voltar para a Home
          </Link>
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