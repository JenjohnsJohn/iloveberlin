import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toVideoCategorySeoSlug } from '@/lib/videos-seo-utils';
import { LatestVideoList } from './latest-video-list';
import type { VideoCardData } from '@/components/videos/video-card';

export const metadata: Metadata = {
  title: 'Berlin Videos',
  description:
    'Watch video series exploring Berlin life, food, culture, and the people who make this city unique.',
  openGraph: {
    title: 'Berlin Videos',
    description:
      'Watch video series exploring Berlin life, food, culture, and the people who make this city unique.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berlin Videos',
  },
  alternates: {
    canonical: 'https://iloveberlin.biz/videos',
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCategories(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=video`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      return items.map((c: Record<string, unknown>) => ({
        name: String(c.name || ''),
        slug: String(c.slug || ''),
        icon: (c.icon || null) as string | null,
        description: (c.description || null) as string | null,
        listing_count: typeof c.listing_count === 'number' ? c.listing_count : undefined,
        children: Array.isArray(c.children)
          ? (c.children as Record<string, unknown>[]).map((child) => ({
              name: String(child.name || ''),
              slug: String(child.slug || ''),
              listing_count: typeof child.listing_count === 'number' ? child.listing_count : undefined,
            }))
          : [],
      }));
    }
  } catch (err) {
    console.error('Failed to load video categories:', err);
  }
  return [];
}

async function getLatestVideos(): Promise<{ videos: VideoCardData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/videos?limit=6&sort=date&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const videos = (items as Record<string, unknown>[]).map((v) => {
        const thumbnail = v.thumbnail as Record<string, unknown> | null;
        const seriesData = v.series as Record<string, unknown> | null;
        const category = v.category as Record<string, unknown> | null;
        return {
          slug: String(v.slug || ''),
          title: String(v.title || ''),
          thumbnailUrl: (thumbnail?.url || null) as string | null,
          seriesName: (seriesData?.name || null) as string | null,
          seriesSlug: (seriesData?.slug || null) as string | null,
          categoryName: (category?.name || null) as string | null,
          categorySlug: (category?.slug || null) as string | null,
          durationSeconds: (v.duration_seconds ?? null) as number | null,
          publishedAt: (v.published_at ?? null) as string | null,
          videoProvider: String(v.video_provider || ''),
        };
      });
      return { videos, total };
    }
  } catch (err) {
    console.error('Failed to load latest videos:', err);
  }
  return { videos: [], total: 0 };
}

export default async function VideosPage() {
  const [categories, { videos: latestVideos, total: videosTotal }] = await Promise.all([
    getCategories(),
    getLatestVideos(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Berlin Videos
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch our video series exploring Berlin life, food, culture, and the people
          who make this city unique.
        </p>
      </section>

      {/* Category Grid */}
      <section>
        <CategoryGrid
          categories={categories}
          basePath="/videos"
          slugTransform={toVideoCategorySeoSlug}
          emptyMessage="No video categories available yet. Check back soon!"
        />
      </section>

      <LatestVideoList initialVideos={latestVideos} initialTotal={videosTotal} />
    </div>
  );
}
