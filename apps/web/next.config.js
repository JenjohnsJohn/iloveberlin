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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.iloveberlin.biz https://www.google-analytics.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
