import { useState, useMemo } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Anuncio from '../../components/Anuncio';
import Sidebar from '../../components/Sidebar';
import Paginacao from '../../components/Paginacao';
import { getPromosByStore, getFixedLinks, getFixedAnuncios, getAboutData, getAllStores } from '../../lib/api';
import { SITE_URL, SITE_TITLE } from '../../config';
import { AnuncioModel } from '../../models/AnuncioModel';

const PROMOS_PER_PAGE = 20;

export default function StorePage({ promos: promosData, fixedLinks, fixedAnuncios, aboutData, stores, storeName, pageImage }) {
  const [currentPage, setCurrentPage] = useState(1);

  const promos = useMemo(() => promosData.map(p => new AnuncioModel(p)), [promosData]);

  const totalPages = Math.ceil(promos.length / PROMOS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROMOS_PER_PAGE;
  const endIndex = startIndex + PROMOS_PER_PAGE;
  const currentPromos = promos.slice(startIndex, endIndex);

  const pageTitle = `Promoções da ${storeName} | ${SITE_TITLE}`;
  const pageDescription = `Veja as melhores promoções da loja ${storeName}.`;
  const imageUrl = `${SITE_URL}${pageImage}`;

  return (
    <div className="min-h-screen bg-surface-100">
       <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={`${SITE_URL}/loja/${storeName}`} />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>
      <Header title={aboutData.title} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-3/4">
            <h1 className="text-3xl font-bold mb-6 border-b pb-4">Promoções da Loja: <span className="text-brand-primary capitalize">{storeName}</span></h1>
            {currentPromos.length > 0 ? (
              currentPromos.map((promo) => (<Anuncio key={promo.id} promo={promo} />))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold">Nenhuma promoção encontrada para esta loja.</h2>
              </div>
            )}
            <Paginacao currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
          <Sidebar links={fixedLinks} anuncios={fixedAnuncios} stores={stores} />
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const stores = getAllStores();
  const paths = stores.map((store) => ({ params: { store: store.toLowerCase() } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const promos = getPromosByStore(params.store);
  const pageImage = promos.length > 0 ? promos[0].imageUrl : '/images/default-og-image.png';

  return {
    props: {
      promos: JSON.parse(JSON.stringify(promos)), //trick to transform model to plain object
      fixedLinks: getFixedLinks(),
      fixedAnuncios: getFixedAnuncios(),
      aboutData: getAboutData(),
      stores: getAllStores(),
      storeName: params.store,
      pageImage,
    },
  };
}