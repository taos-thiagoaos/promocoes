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
  // Expondo o basePath como uma variável de ambiente para o cliente
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? repoName : '',
  },
};

export default nextConfig;
