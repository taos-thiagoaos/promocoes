import { useState } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Anuncio from '../../components/Anuncio';
import Sidebar from '../../components/Sidebar';
import Paginacao from '../../components/Paginacao';
import { getPromosByStore, getFixedLinks, getFixedAnuncios, getAboutData, getAllStores } from '../../lib/api';

const PROMOS_PER_PAGE = 20;

export default function StorePage({ promos, fixedLinks, fixedAnuncios, aboutData, stores, storeName }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(promos.length / PROMOS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROMOS_PER_PAGE;
  const endIndex = startIndex + PROMOS_PER_PAGE;
  const currentPromos = promos.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-surface-100">
       <Head>
        <title>Promoções da {storeName} | Blog Pessoal de Thiago</title>
        <meta name="description" content={`Veja as melhores promoções da loja ${storeName}.`} />
      </Head>
      <Header title={aboutData.title} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-3/4">
            <h1 className="text-3xl font-bold mb-6 border-b pb-4">
              Promoções da Loja: <span className="text-brand-primary capitalize">{storeName}</span>
            </h1>
            {currentPromos.length > 0 ? (
              currentPromos.map((promo) => (
                <Anuncio key={promo.id} promo={promo} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold">Nenhuma promoção encontrada para esta loja.</h2>
              </div>
            )}
            <Paginacao
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
          <Sidebar links={fixedLinks} anuncios={fixedAnuncios} stores={stores} />
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const stores = getAllStores();
  const paths = stores.map((store) => ({
    params: { store: store.toLowerCase() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const promos = getPromosByStore(params.store);
  const fixedLinks = getFixedLinks();
  const fixedAnuncios = getFixedAnuncios();
  const aboutData = getAboutData();
  const allStores = getAllStores();

  return {
    props: {
      promos,
      fixedLinks,
      fixedAnuncios,
      aboutData,
      stores: allStores,
      storeName: params.store,
    },
  };
}