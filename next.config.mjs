const isProd = process.env.NODE_ENV === 'production';
const repoName = '/promocoes';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Adiciona o prefixo do repositório apenas em produção
  basePath: isProd ? repoName : undefined,
  assetPrefix: isProd ? repoName + '/' : undefined,
  images: {
    unoptimized: true,
    domains: ['placehold.co'],
  },
  // Expondo o basePath para ser acessível no lado do cliente
  publicRuntimeConfig: {
    basePath: isProd ? repoName : '',
  },
};

export default nextConfig;