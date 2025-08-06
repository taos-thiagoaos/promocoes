/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['placehold.co', 'm.media-amazon.com'],
  },
};

export default nextConfig;
