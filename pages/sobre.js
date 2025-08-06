import Head from 'next/head';
import Header from '../components/Header';
import { getAboutData } from '../lib/api';
import { SITE_URL, SITE_TITLE, SHORT_SITE_TITLE } from '../config';

export default function Sobre({ aboutData, pageImage }) {
  const imageUrl = `${SITE_URL}${pageImage}`;
  const pageTitle = `Sobre | ${SITE_TITLE}`;

  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={aboutData.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={aboutData.description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={`${SITE_URL}/sobre`} />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>
      <Header title={SITE_TITLE} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{aboutData.title || 'Título não encontrado.'}</h1>
          <p className="text-lg text-gray-700 mb-6 whitespace-pre-wrap">
            {aboutData.description || 'Descrição não encontrada.'}
          </p>
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Meus Links</h2>
            <ul className="space-y-3">
              {aboutData.instagramUrl && (
                <li>
                  <a
                    href={aboutData.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-primary hover:text-brand-secondary"
                  >
                    📷 Instagram
                  </a>
                </li>
              )}
              {aboutData.amazonUrl && (
                <li>
                  <a
                    href={aboutData.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-primary hover:text-brand-secondary"
                  >
                    🛒 Minha Página de Produtos na Amazon
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const pageImage = '/images/default-og-image.png';
  return { props: { aboutData: getAboutData(), pageImage } };
}
