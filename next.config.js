
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'fstarot.com', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'drive.google.com', pathname: '/uc**' },
    ],
  },
};
module.exports = nextConfig;
