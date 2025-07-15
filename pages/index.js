import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Anuncio from '../components/Anuncio';
import Sidebar from '../components/Sidebar';
import Paginacao from '../components/Paginacao';
import { getAllPromos, getFixedLinks, getFixedAnuncios, getAboutData, getAllStores } from '../lib/api';

const PROMOS_PER_PAGE = 20;

export default function Home({ allPromos, fixedLinks, fixedAnuncios, aboutData, stores }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allPromos.length / PROMOS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROMOS_PER_PAGE;
  const endIndex = startIndex + PROMOS_PER_PAGE;
  const currentPromos = allPromos.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>Blog Pessoal de Thiago - Promoções</title>
        <meta name="description" content={aboutData.description} />
      </Head>
      <Header title={aboutData.title} />
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
  const fixedLinks = getFixedLinks();
  const fixedAnuncios = getFixedAnuncios();
  const aboutData = getAboutData();
  const stores = getAllStores();

  return {
    props: {
      allPromos,
      fixedLinks,
      fixedAnuncios,
      aboutData,
      stores,
    },
  };
}