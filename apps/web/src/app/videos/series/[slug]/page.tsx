import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeriesContent } from './series-content';
import { API_URL, SITE_URL } from '@/lib/constants';

interface SeriesData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: { url: string } | null;
}

interface VideoItem {
  slug: string;
  title: string;
  thumbnail: { url: string } | null;
  series: { name: string; slug: string } | null;
  duration_seconds: number | null;
  published_at: string | null;
  video_provider: string;
}

async function getSeries(slug: string): Promise<SeriesData | null> {
  try {
    const res = await fetch(`${API_URL}/videos/series/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
  } catch {
    // Network error
  }
  return null;
}

async function getSeriesVideos(seriesSlug: string): Promise<VideoItem[]> {
  try {
    const res = await fetch(
      `${API_URL}/videos?series=${seriesSlug}&limit=50`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const result = await res.json();
      return result.data || [];
    }
  } catch {
    // Network error
  }
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) return { title: 'Series Not Found' };

  const description =
    series.description?.replace(/<[^>]*>/g, '').slice(0, 200) || undefined;

  return {
    title: `${series.name} - Video Series`,
    description,
    openGraph: {
      title: `${series.name} - Video Series`,
      description,
      type: 'website',
      images: series.thumbnail ? [series.thumbnail.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${series.name} - Video Series`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/videos/series/${series.slug}`,
    },
  };
}

export default async function VideoSeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getSeries(slug);

  if (!series) {
    notFound();
  }

  const videos = await getSeriesVideos(slug);

  return (
    <SeriesContent
      series={{
        name: series.name,
        slug: series.slug,
        description: series.description,
      }}
      videos={videos.map((v) => ({
        slug: v.slug,
        title: v.title,
        thumbnailUrl: v.thumbnail?.url || null,
        seriesName: v.series?.name || null,
        seriesSlug: v.series?.slug || null,
        durationSeconds: v.duration_seconds,
        publishedAt: v.published_at,
        videoProvider: v.video_provider,
      }))}
    />
  );
}
