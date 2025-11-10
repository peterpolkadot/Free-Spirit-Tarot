
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // ⚡ Skip optimization for instant loads
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fstarot.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
