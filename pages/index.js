import { useState } from 'react';
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
      <Header title={aboutData.title} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-3/4">
            {currentPromos.map((promo) => (
              <Anuncio key={promo.id} promo={promo} />
            ))}
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

// Esta função roda no momento do build
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