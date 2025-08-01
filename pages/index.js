import { useState, useMemo } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Anuncio from '../components/Anuncio';
import Sidebar from '../components/Sidebar';
import Paginacao from '../components/Paginacao';
import { getAllPromos, getFixedLinks, getFixedAnuncios, getAboutData, getAllStores } from '../lib/api';
import { SITE_URL, SITE_TITLE } from '../config';
import { AnuncioModel } from '../models/AnuncioModel';

const PROMOS_PER_PAGE = 20;

export default function Home({ allPromos: allPromosData, fixedLinks, fixedAnuncios, aboutData, stores, pageImage }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Re-hidrata os dados brutos em instâncias do modelo, usando useMemo para performance
  const allPromos = useMemo(() => allPromosData.map(p => new AnuncioModel(p)), [allPromosData]);

  const totalPages = Math.ceil(allPromos.length / PROMOS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROMOS_PER_PAGE;
  const endIndex = startIndex + PROMOS_PER_PAGE;
  const currentPromos = allPromos.slice(startIndex, endIndex);
  
  const imageUrl = `${SITE_URL}${pageImage}`;

  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={aboutData.description} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={aboutData.description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>
      <Header title={SITE_TITLE} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-3/4">
            {currentPromos.length > 0 ? (
              currentPromos.map((promo) => (
                <Anuncio key={promo.id} promo={promo} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold">Nenhuma promoção encontrada.</h2>
                <p className="text-gray-600 mt-2">Volte mais tarde para ver as novidades!</p>
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

export async function getStaticProps() {
  const allPromos = getAllPromos();
  const pageImage = '/images/default-og-image.png';

  return {
    props: {
      // Serializa os dados para o cliente
      allPromos: JSON.parse(JSON.stringify(allPromos)),
      fixedLinks: getFixedLinks(),
      fixedAnuncios: getFixedAnuncios(),
      aboutData: getAboutData(),
      stores: getAllStores(),
      pageImage,
    },
  };
}