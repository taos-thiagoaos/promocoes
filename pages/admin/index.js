import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Header from '../../components/Header';
import AdminForm from '../../components/AdminForm';
import { getAboutData } from '../../lib/api';
import { SITE_TITLE } from '../../config';

export default function AdminPage({ aboutData }) {
  const { data: session, status } = useSession();
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
          <AdminForm />
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  return { props: { aboutData: getAboutData() } };
}