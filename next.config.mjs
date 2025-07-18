const isProd = process.env.NODE_ENV === 'production';
const repoName = '/promocoes';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A configuração 'output' agora é condicional
  output: isProd ? 'export' : undefined,
  reactStrictMode: true,
  basePath: isProd ? repoName : undefined,
  assetPrefix: isProd ? repoName + '/' : undefined,
  images: {
    unoptimized: true,
    domains: ['placehold.co'],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? repoName : '',
  },
};

export default nextConfig;