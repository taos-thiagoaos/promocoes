import Head from 'next/head';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const Meta = ({ title, description, image }) => {
  const siteTitle = "Blog Pessoal de Thiago";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteUrl = "https://taos-thiagoaos.github.io/promocoes";
  const defaultDescription = "As melhores promoções de produtos que considero úteis e utilizo no meu dia a dia, além de dicas dos produtos.";
  const finalDescription = description || defaultDescription;
  const defaultImage = `${siteUrl}/images/default-og-image.png`; // Crie uma imagem padrão
  const imageUrl = image ? `${siteUrl}${image}` : defaultImage;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={imageUrl} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={imageUrl} />
    </Head>
  );
};

export default Meta;