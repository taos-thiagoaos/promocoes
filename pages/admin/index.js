import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Header from '../../components/Header';
import { useState, useEffect } from 'react';
import AdminForm from '../../components/AdminForm';
import ScrapeAmazonForm from '../../components/ScrapeAmazonForm';
import { getAboutData, getPromoById } from '../../lib/api';
import { SITE_TITLE } from '../../config';
import { isUserAllowed } from '../../lib/auth';

export default function AdminPage({ aboutData, initialData }) {
  const { data: session, status } = useSession();
  const [scrapedData, setScrapedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScrapeSuccess = (data) => {
    setScrapedData(data);
  };

  const loading = status === 'loading';

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-surface-100">
        <Head>
          <title>Admin Login | {SITE_TITLE}</title>
        </Head>
        <Header title={aboutData.title} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
            <p className="mb-6">Você precisa fazer login para acessar a área administrativa.</p>
            <button onClick={() => signIn('github')} className="btn btn-primary w-full">
              Login com GitHub
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>Admin | {SITE_TITLE}</title>
      </Head>
      <Header title={aboutData.title} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
          <ScrapeAmazonForm onScrapeSuccess={handleScrapeSuccess} onLoading={setIsLoading} />
          <AdminForm scrapedData={scrapedData} isLoading={isLoading} initialData={initialData} />
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const allowed = await isUserAllowed(context.req);

  if (!allowed) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

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