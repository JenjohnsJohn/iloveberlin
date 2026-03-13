/** @type {import('next').NextConfig} */
const nextConfig = {
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
