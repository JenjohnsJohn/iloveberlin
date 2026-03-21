import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { VideoContent } from './video-content';
import { buildVideoUrl, toVideoCategorySeoSlug } from '@/lib/videos-seo-utils';
import { API_URL, SITE_URL } from '@/lib/constants';
import { safeJsonLdStringify } from '@/lib/json-ld';

interface VideoData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  video_url: string;
  video_provider: 'youtube' | 'vimeo' | 'other';
  thumbnail: { url: string } | null;
  series: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  tags: { id: string; name: string }[];
  duration_seconds: number | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

async function getVideo(slug: string): Promise<VideoData | null> {
  try {
    const res = await fetch(`${API_URL}/videos/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
  } catch {
    // Network error
  }
  return null;
}

function getEmbedUrl(videoUrl: string, provider: string): string {
  if (provider === 'youtube') {
    const match = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    );
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  if (provider === 'vimeo') {
    const match = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  }
  return videoUrl;
}

function formatDurationISO(seconds: number | null): string | undefined {
  if (!seconds) return undefined;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `PT${mins}M${secs}S`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) return { title: 'Video Not Found' };

  const description =
    video.description?.replace(/<[^>]*>/g, '').slice(0, 200) || undefined;
  const categorySlug = video.category?.slug || null;

  return {
    title: video.title,
    description,
    openGraph: {
      title: video.title,
      description,
      type: 'video.other',
      images: video.thumbnail ? [video.thumbnail.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}${buildVideoUrl(slug, categorySlug)}`,
    },
  };
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const video = await getVideo(slug);

  if (!video) {
    notFound();
  }

  // Validate category segment matches video's actual category
  const actualCategorySlug = video.category?.slug || null;
  const expectedCategorySegment = toVideoCategorySeoSlug(actualCategorySlug || 'general');
  if (category !== expectedCategorySegment) {
    permanentRedirect(buildVideoUrl(slug, actualCategorySlug));
  }

  const embedUrl = getEmbedUrl(video.video_url, video.video_provider);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description?.replace(/<[^>]*>/g, '').slice(0, 200),
    thumbnailUrl: video.thumbnail?.url,
    uploadDate: video.published_at || video.created_at,
    duration: formatDurationISO(video.duration_seconds),
    embedUrl,
    contentUrl: video.video_url,
    publisher: {
      '@type': 'Organization',
      name: 'ILOVEBERLIN',
      url: SITE_URL,
    },
    ...(video.view_count > 0
      ? {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'http://schema.org/WatchAction',
            userInteractionCount: video.view_count,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <VideoContent
        video={{
          id: video.id,
          slug: video.slug,
          title: video.title,
          description: video.description,
          embedUrl,
          thumbnailUrl: video.thumbnail?.url || null,
          seriesName: video.series?.name || null,
          seriesSlug: video.series?.slug || null,
          categoryName: video.category?.name || null,
          durationSeconds: video.duration_seconds,
          publishedAt: video.published_at,
          tags: video.tags.map((t) => t.name),
        }}
      />
    </>
  );
}
