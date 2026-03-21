import { MetadataRoute } from 'next';
import { buildArticleUrl, buildCategoryUrl } from '@/lib/news-seo-utils';
import { buildEventUrl, buildEventCategoryUrl } from '@/lib/events-seo-utils';
import { buildRestaurantUrl, buildDiningCuisineUrl } from '@/lib/dining-seo-utils';
import { buildGuideUrl, buildGuideTopicUrl } from '@/lib/guide-seo-utils';
import { buildVideoUrl, buildVideoCategoryUrl } from '@/lib/videos-seo-utils';
import { buildCompetitionUrl, buildCompetitionCategoryUrl } from '@/lib/competitions-seo-utils';
import { API_URL, SITE_URL } from '@/lib/constants';

const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Fetch published articles
  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/articles?limit=1000&status=published`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      articleEntries = items.map((a: Record<string, unknown>) => {
        const cat = a.category as Record<string, unknown> | null;
        const categorySlug = String(cat?.slug || '');
        const articleSlug = String(a.slug || '');
        return {
          url: `${BASE_URL}${buildArticleUrl(articleSlug, categorySlug)}`,
          lastModified: new Date(String(a.updated_at || a.published_at || a.created_at || new Date().toISOString())),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
    }
  } catch {
    // Continue with static entries only
  }

  // Fetch article categories
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=article`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      categoryEntries = items.flatMap((c: Record<string, unknown>) => {
        const entries: MetadataRoute.Sitemap = [
          {
            url: `${BASE_URL}${buildCategoryUrl(String(c.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
        ];
        const children = Array.isArray(c.children) ? c.children : [];
        for (const child of children) {
          const childObj = child as Record<string, unknown>;
          entries.push({
            url: `${BASE_URL}${buildCategoryUrl(String(childObj.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          });
        }
        return entries;
      });
    }
  } catch {
    // Continue without category entries
  }

  // Fetch published events
  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/events?limit=1000&status=published`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      eventEntries = items.map((e: Record<string, unknown>) => {
        const cat = e.category as Record<string, unknown> | null;
        const categorySlug = String(cat?.slug || '');
        const eventSlug = String(e.slug || '');
        return {
          url: `${BASE_URL}${buildEventUrl(eventSlug, categorySlug)}`,
          lastModified: new Date(String(e.updated_at || e.published_at || e.created_at || new Date().toISOString())),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
    }
  } catch {
    // Continue without event entries
  }

  // Fetch event categories
  let eventCategoryEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=event`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      eventCategoryEntries = items.flatMap((c: Record<string, unknown>) => {
        const entries: MetadataRoute.Sitemap = [
          {
            url: `${BASE_URL}${buildEventCategoryUrl(String(c.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
        ];
        const children = Array.isArray(c.children) ? c.children : [];
        for (const child of children) {
          const childObj = child as Record<string, unknown>;
          entries.push({
            url: `${BASE_URL}${buildEventCategoryUrl(String(childObj.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          });
        }
        return entries;
      });
    }
  } catch {
    // Continue without event category entries
  }

  // Fetch published restaurants
  let restaurantEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/dining/restaurants?limit=1000&status=published`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      restaurantEntries = items.map((r: Record<string, unknown>) => {
        const cuisines = r.cuisines as Record<string, unknown>[] | undefined;
        const primaryCuisineSlug = Array.isArray(cuisines) && cuisines.length > 0 ? String(cuisines[0].slug || '') : '';
        const restaurantSlug = String(r.slug || '');
        return {
          url: `${BASE_URL}${buildRestaurantUrl(restaurantSlug, primaryCuisineSlug)}`,
          lastModified: new Date(String(r.updated_at || r.created_at || new Date().toISOString())),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
    }
  } catch {
    // Continue without restaurant entries
  }

  // Fetch dining cuisines
  let cuisineEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/dining/cuisines/tree`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      cuisineEntries = items.flatMap((c: Record<string, unknown>) => {
        const entries: MetadataRoute.Sitemap = [
          {
            url: `${BASE_URL}${buildDiningCuisineUrl(String(c.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
        ];
        const children = Array.isArray(c.children) ? c.children : [];
        for (const child of children) {
          const childObj = child as Record<string, unknown>;
          entries.push({
            url: `${BASE_URL}${buildDiningCuisineUrl(String(childObj.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          });
        }
        return entries;
      });
    }
  } catch {
    // Continue without cuisine entries
  }

  // Fetch published guides
  let guideEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/guides?limit=1000&status=published`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      guideEntries = items.map((g: Record<string, unknown>) => {
        const topic = g.topic as Record<string, unknown> | null;
        const topicSlug = String(topic?.slug || '');
        const guideSlug = String(g.slug || '');
        return {
          url: `${BASE_URL}${buildGuideUrl(guideSlug, topicSlug)}`,
          lastModified: new Date(String(g.updated_at || g.published_at || g.created_at || new Date().toISOString())),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
    }
  } catch {
    // Continue without guide entries
  }

  // Fetch guide topics
  let guideTopicEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/guides/topics/tree`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      guideTopicEntries = items.flatMap((t: Record<string, unknown>) => {
        const entries: MetadataRoute.Sitemap = [
          {
            url: `${BASE_URL}${buildGuideTopicUrl(String(t.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
        ];
        const children = Array.isArray(t.children) ? t.children : [];
        for (const child of children) {
          const childObj = child as Record<string, unknown>;
          entries.push({
            url: `${BASE_URL}${buildGuideTopicUrl(String(childObj.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          });
        }
        return entries;
      });
    }
  } catch {
    // Continue without guide topic entries
  }

  // Fetch published videos
  let videoEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/videos?limit=1000&status=published`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      videoEntries = items.map((v: Record<string, unknown>) => {
        const cat = v.category as Record<string, unknown> | null;
        const categorySlug = String(cat?.slug || '');
        const videoSlug = String(v.slug || '');
        return {
          url: `${BASE_URL}${buildVideoUrl(videoSlug, categorySlug)}`,
          lastModified: new Date(String(v.updated_at || v.published_at || v.created_at || new Date().toISOString())),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
    }
  } catch {
    // Continue without video entries
  }

  // Fetch video categories
  let videoCategoryEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=video`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      videoCategoryEntries = items.flatMap((c: Record<string, unknown>) => {
        const entries: MetadataRoute.Sitemap = [
          {
            url: `${BASE_URL}${buildVideoCategoryUrl(String(c.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
        ];
        const children = Array.isArray(c.children) ? c.children : [];
        for (const child of children) {
          const childObj = child as Record<string, unknown>;
          entries.push({
            url: `${BASE_URL}${buildVideoCategoryUrl(String(childObj.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          });
        }
        return entries;
      });
    }
  } catch {
    // Continue without video category entries
  }

  // Fetch published competitions
  let competitionEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/competitions?limit=1000&status=active`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      competitionEntries = items.map((c: Record<string, unknown>) => {
        const cat = c.category as Record<string, unknown> | null;
        const categorySlug = String(cat?.slug || '');
        const compSlug = String(c.slug || '');
        return {
          url: `${BASE_URL}${buildCompetitionUrl(compSlug, categorySlug)}`,
          lastModified: new Date(String(c.updated_at || c.created_at || new Date().toISOString())),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
    }
  } catch {
    // Continue without competition entries
  }

  // Fetch competition categories
  let competitionCategoryEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=competition`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      competitionCategoryEntries = items.flatMap((c: Record<string, unknown>) => {
        const entries: MetadataRoute.Sitemap = [
          {
            url: `${BASE_URL}${buildCompetitionCategoryUrl(String(c.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          },
        ];
        const children = Array.isArray(c.children) ? c.children : [];
        for (const child of children) {
          const childObj = child as Record<string, unknown>;
          entries.push({
            url: `${BASE_URL}${buildCompetitionCategoryUrl(String(childObj.slug || ''))}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
          });
        }
        return entries;
      });
    }
  } catch {
    // Continue without competition category entries
  }

  return [
    ...staticEntries,
    ...categoryEntries,
    ...articleEntries,
    ...eventCategoryEntries,
    ...eventEntries,
    ...cuisineEntries,
    ...restaurantEntries,
    ...guideTopicEntries,
    ...guideEntries,
    ...videoCategoryEntries,
    ...videoEntries,
    ...competitionCategoryEntries,
    ...competitionEntries,
  ];
}
