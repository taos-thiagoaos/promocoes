const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Adiciona o prefixo do repositório apenas em produção
  basePath: isProd ? '/promocoes' : undefined,
  assetPrefix: isProd ? '/promocoes/' : undefined,
  images: {
    unoptimized: true,
    domains: ['placehold.co'],
  },
};

export default nextConfig;