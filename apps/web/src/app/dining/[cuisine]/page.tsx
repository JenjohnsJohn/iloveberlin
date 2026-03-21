import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { CuisineContent } from './cuisine-content';
import { fromDiningCuisineSeoSlug, buildRestaurantUrl } from '@/lib/dining-seo-utils';
import { API_URL, SITE_URL } from '@/lib/constants';

async function getCuisineName(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/dining/cuisines/tree`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      for (const cuisine of items) {
        if (cuisine.slug === slug) return cuisine.name;
        if (Array.isArray(cuisine.children)) {
          for (const child of cuisine.children) {
            if (child.slug === slug) return child.name;
          }
        }
      }
    }
  } catch {
    // API error
  }
  return null;
}

async function getRestaurantBySlug(slug: string): Promise<{ slug: string; cuisines?: { slug: string }[] } | null> {
  try {
    const res = await fetch(`${API_URL}/dining/restaurants/${slug}`, {
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
  params: Promise<{ cuisine: string }>;
}): Promise<Metadata> {
  const { cuisine } = await params;
  const rawSlug = fromDiningCuisineSeoSlug(cuisine);

  if (!rawSlug) {
    return { title: 'Redirecting...' };
  }

  const cuisineName = await getCuisineName(rawSlug);
  if (!cuisineName) return { title: 'Cuisine Not Found' };

  return {
    title: `${cuisineName} Restaurants in Berlin - ILOVEBERLIN`,
    description: `Discover the best ${cuisineName.toLowerCase()} restaurants and eateries in Berlin.`,
    alternates: {
      canonical: `${SITE_URL}/dining/${cuisine}`,
    },
    openGraph: {
      title: `${cuisineName} Restaurants in Berlin`,
      description: `Discover the best ${cuisineName.toLowerCase()} restaurants and eateries in Berlin.`,
    },
  };
}

export default async function DiningCuisinePage({
  params,
}: {
  params: Promise<{ cuisine: string }>;
}) {
  const { cuisine } = await params;
  const rawSlug = fromDiningCuisineSeoSlug(cuisine);

  if (rawSlug) {
    const cuisineName = await getCuisineName(rawSlug);
    if (cuisineName) {
      return <CuisineContent cuisineSlug={rawSlug} cuisineName={cuisineName} />;
    }
    const fallbackName = rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <CuisineContent cuisineSlug={rawSlug} cuisineName={fallbackName} />;
  }

  // Not a valid SEO slug — check if it's a legacy restaurant slug
  const restaurant = await getRestaurantBySlug(cuisine);
  if (restaurant) {
    const cuisineSlug = restaurant.cuisines?.[0]?.slug || null;
    permanentRedirect(buildRestaurantUrl(restaurant.slug, cuisineSlug));
  }

  notFound();
}
