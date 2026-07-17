/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['youtube-dl-exec'],
  async rewrites() {
    return [
      {
        source: '/p/:path*',
        destination: '/',
      },
      {
        source: '/watch/:path*',
        destination: '/',
      },
      {
        source: '/:path*.html',
        destination: '/',
      }
    ];
  },
};

export default nextConfig;
