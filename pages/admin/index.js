import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Header from '../../components/Header';
import { useState, useEffect } from 'react';
import AdminForm from '../../components/AdminForm';
import ScrapeAmazonForm from '../../components/ScrapeAmazonForm';
import { getAboutData, getPromoById } from '../../lib/api';
import { SHORT_SITE_TITLE } from '@/config';

function AdminPage({ aboutData, initialData }) {
  const [scrapedData, setScrapedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScrapeSuccess = (data) => {
    setScrapedData(data);
  };

  const title = `${SHORT_SITE_TITLE} - Painel Administrativo`

  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>{title}</title>
      </Head>
      <Header title={title} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <ScrapeAmazonForm onScrapeSuccess={handleScrapeSuccess} onLoading={setIsLoading} />
          <h2 className="text-2xl font-bold mb-4">Formulário</h2>
          <AdminForm scrapedData={scrapedData} isLoading={isLoading} setIsLoading={setIsLoading} initialData={initialData} />
        </div>
      </main>
    </div>
  );
}

AdminPage.auth = {
  role: "admin",
  loading: <div>Carregando...</div>,
}

export default AdminPage

export async function getServerSideProps(context) {
  const { edit, date } = context.query;
  let promoData = null;

  if (edit && date) {
    promoData = getPromoById(edit, date);
  }

  return {
    props: { 
      aboutData: getAboutData(),
      initialData: promoData ? JSON.parse(JSON.stringify(promoData)) : null,
    }, 
  };
}