/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export', // Essencial para exportar como site estático para o GitHub Pages
  reactStrictMode: true,
  images: {
    unoptimized: true, // Necessário para o 'next export'
    domains: ['placehold.co'], // Adicione aqui os domínios das imagens que você vai usar
  },
};

export default nextConfig;