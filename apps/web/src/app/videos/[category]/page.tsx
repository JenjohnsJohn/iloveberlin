import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { VideoCategoryContent } from './video-category-content';
import { fromVideoCategorySeoSlug, buildVideoUrl } from '@/lib/videos-seo-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCategoryName(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/categories/slug/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) return data.name;
    }
  } catch {
    // API error
  }
  return null;
}

async function getVideoBySlug(slug: string): Promise<{ slug: string; category?: { slug: string } } | null> {
  try {
    const res = await fetch(`${API_URL}/videos/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
  } catch {
    // API error
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const rawSlug = fromVideoCategorySeoSlug(category);

  if (!rawSlug) {
    return { title: 'Redirecting...' };
  }

  const categoryName = await getCategoryName(rawSlug);
  if (!categoryName) return { title: 'Category Not Found' };

  return {
    title: `${categoryName} Videos - ILoveBerlin`,
    description: `Watch ${categoryName.toLowerCase()} videos from Berlin.`,
    openGraph: {
      title: `${categoryName} Videos - ILoveBerlin`,
      description: `Watch ${categoryName.toLowerCase()} videos from Berlin.`,
    },
  };
}

export default async function VideoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const rawSlug = fromVideoCategorySeoSlug(category);

  if (rawSlug) {
    const categoryName = await getCategoryName(rawSlug);
    if (categoryName) {
      return <VideoCategoryContent categorySlug={rawSlug} categoryName={categoryName} />;
    }
    const fallbackName = rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <VideoCategoryContent categorySlug={rawSlug} categoryName={fallbackName} />;
  }

  // Not a valid SEO slug — check if it's a legacy video slug
  const video = await getVideoBySlug(category);
  if (video) {
    const categorySlug = video.category?.slug || null;
    permanentRedirect(buildVideoUrl(video.slug, categorySlug));
  }

  notFound();
}
