/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/news/category/:slug',
        destination: '/news/berlin-:slug-news',
        permanent: true,
      },
      {
        source: '/events/category/:slug',
        destination: '/events/berlin-:slug-events',
        permanent: true,
      },
      {
        source: '/dining/cuisine/:slug',
        destination: '/dining/berlin-:slug-dining',
        permanent: true,
      },
      {
        source: '/videos/category/:slug',
        destination: '/videos/berlin-:slug-videos',
        permanent: true,
      },
      {
        source: '/competitions/category/:slug',
        destination: '/competitions/berlin-:slug-competitions',
        permanent: true,
      },
    ];
  },
  transpilePackages: ['@iloveberlin/ui', '@iloveberlin/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.iloveberlin.biz',
      },
    ],
  },
  eslint: {
    // Pre-existing lint issues (react-hooks plugin missing from flat config).
    // Lint is still run separately via `pnpm lint`.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
