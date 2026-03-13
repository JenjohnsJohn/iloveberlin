import { MetadataRoute } from 'next';

const BASE_URL = 'https://iloveberlin.biz';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/news',
    '/guide',
    '/events',
    '/dining',
    '/videos',
    '/competitions',
    '/classifieds',
    '/store',
  ];

  return staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }));
}
