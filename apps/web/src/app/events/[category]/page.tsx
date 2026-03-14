import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { EventCategoryContent } from './event-category-content';
import { fromEventCategorySeoSlug, buildEventUrl } from '@/lib/events-seo-utils';

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

async function getEventBySlug(slug: string): Promise<{ slug: string; category?: { slug: string } } | null> {
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, {
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
  const rawSlug = fromEventCategorySeoSlug(category);

  if (!rawSlug) {
    // Might be a legacy event slug — metadata will be handled by redirect or 404
    return { title: 'Redirecting...' };
  }

  const categoryName = await getCategoryName(rawSlug);
  if (!categoryName) return { title: 'Category Not Found' };

  return {
    title: `${categoryName} Events in Berlin - ILoveBerlin`,
    description: `Discover the best ${categoryName.toLowerCase()} events happening in Berlin.`,
    openGraph: {
      title: `${categoryName} Events in Berlin`,
      description: `Discover the best ${categoryName.toLowerCase()} events happening in Berlin.`,
    },
  };
}

export default async function EventCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const rawSlug = fromEventCategorySeoSlug(category);

  if (rawSlug) {
    // Valid SEO slug like "berlin-concerts-events" → raw slug "concerts"
    const categoryName = await getCategoryName(rawSlug);
    if (categoryName) {
      return <EventCategoryContent categorySlug={rawSlug} categoryName={categoryName} />;
    }
    // Category not found in API — use title-case fallback
    const fallbackName = rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <EventCategoryContent categorySlug={rawSlug} categoryName={fallbackName} />;
  }

  // Not a valid SEO slug — check if it's a legacy event slug
  const event = await getEventBySlug(category);
  if (event) {
    const categorySlug = event.category?.slug || null;
    permanentRedirect(buildEventUrl(event.slug, categorySlug));
  }

  notFound();
}
