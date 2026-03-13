import type { Metadata } from 'next';
import { VideosContent } from './videos-content';
import type { VideoCardData } from '@/components/videos/video-card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiVideo {
  slug: string;
  title: string;
  thumbnail: { url: string } | null;
  series: { name: string; slug: string } | null;
  duration_seconds: number | null;
  published_at: string | null;
  video_provider: string;
}

interface SeriesItem {
  name: string;
  slug: string;
}

function mapApiVideo(v: ApiVideo): VideoCardData {
  return {
    slug: v.slug,
    title: v.title,
    thumbnailUrl: v.thumbnail?.url || null,
    seriesName: v.series?.name || null,
    seriesSlug: v.series?.slug || null,
    durationSeconds: v.duration_seconds,
    publishedAt: v.published_at,
    videoProvider: v.video_provider,
  };
}

async function getVideos(): Promise<VideoCardData[]> {
  try {
    const res = await fetch(`${API_URL}/videos?limit=50`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const result = await res.json();
      return (result.data || []).map(mapApiVideo);
    }
  } catch {
    // Network error
  }
  return [];
}

async function getSeries(): Promise<SeriesItem[]> {
  try {
    const res = await fetch(`${API_URL}/videos/series`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return (data || []).map((s: SeriesItem) => ({
        name: s.name,
        slug: s.slug,
      }));
    }
  } catch {
    // Network error
  }
  return [];
}

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

export default async function VideosPage() {
  const [videos, series] = await Promise.all([getVideos(), getSeries()]);

  return <VideosContent videos={videos} series={series} />;
}
