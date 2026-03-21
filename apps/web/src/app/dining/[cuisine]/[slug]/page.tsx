import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { RestaurantContent } from './restaurant-content';
import { buildRestaurantUrl, toDiningCuisineSeoSlug } from '@/lib/dining-seo-utils';
import { API_URL, SITE_URL } from '@/lib/constants';
import { safeJsonLdStringify } from '@/lib/json-ld';

interface RestaurantData {
  id: string;
  slug: string;
  name: string;
  description: string;
  featured_image: { url: string } | null;
  cuisines: { name: string; slug: string }[];
  price_range: string;
  rating: number | null;
  address: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  opening_hours: Record<string, string>;
  images: { media: { url: string }; caption: string | null; sort_order: number }[];
  offers: {
    id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
  }[];
}

async function getRestaurant(slug: string): Promise<RestaurantData | null> {
  try {
    const res = await fetch(`${API_URL}/dining/restaurants/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
    return null;
  } catch {
    return null;
  }
}

function priceRangeDisplay(range: string): string {
  switch (range) {
    case 'budget': return '$';
    case 'moderate': return '$$';
    case 'upscale': return '$$$';
    case 'fine_dining': return '$$$$';
    default: return '$$';
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cuisine: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return { title: 'Restaurant Not Found' };

  const description = restaurant.description?.replace(/<[^>]*>/g, '').slice(0, 200) || undefined;
  const primaryCuisineSlug = restaurant.cuisines[0]?.slug || null;

  return {
    title: restaurant.name,
    description,
    openGraph: {
      title: restaurant.name,
      description,
      type: 'website',
      images: restaurant.featured_image ? [restaurant.featured_image.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.name,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}${buildRestaurantUrl(slug, primaryCuisineSlug)}`,
    },
  };
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ cuisine: string; slug: string }>;
}) {
  const { cuisine, slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  // Validate cuisine segment matches restaurant's primary cuisine
  const primaryCuisineSlug = restaurant.cuisines[0]?.slug || null;
  const expectedCuisineSegment = toDiningCuisineSeoSlug(primaryCuisineSlug || 'general');
  if (cuisine !== expectedCuisineSegment) {
    permanentRedirect(buildRestaurantUrl(slug, primaryCuisineSlug));
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Dining',
        item: `${SITE_URL}/dining`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: restaurant.cuisines[0]?.name || 'Restaurants',
        item: `${SITE_URL}/dining/${cuisine}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: restaurant.name,
      },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description?.replace(/<[^>]*>/g, '').slice(0, 200),
    image: restaurant.featured_image?.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressLocality: 'Berlin',
      addressCountry: 'DE',
    },
    ...(restaurant.latitude && restaurant.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          },
        }
      : {}),
    telephone: restaurant.phone || undefined,
    url: restaurant.website || `${SITE_URL}${buildRestaurantUrl(slug, primaryCuisineSlug)}`,
    servesCuisine: restaurant.cuisines.map((c) => c.name),
    priceRange: priceRangeDisplay(restaurant.price_range),
    ...(restaurant.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: restaurant.rating,
            bestRating: 5,
          },
        }
      : {}),
    ...(Object.keys(restaurant.opening_hours).length > 0
      ? {
          openingHoursSpecification: Object.entries(restaurant.opening_hours)
            .filter(([, hours]) => hours !== 'Closed')
            .map(([day, hours]) => {
              const [open, close] = hours.split(' - ');
              return {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: day,
                opens: open?.trim(),
                closes: close?.trim(),
              };
            }),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <RestaurantContent
        restaurant={{
          id: restaurant.id,
          slug: restaurant.slug,
          name: restaurant.name,
          description: restaurant.description,
          featuredImage: restaurant.featured_image?.url || null,
          cuisines: restaurant.cuisines.map((c) => c.name),
          cuisineSlugs: restaurant.cuisines.map((c) => c.slug),
          priceRange: restaurant.price_range,
          rating: restaurant.rating,
          address: restaurant.address,
          district: restaurant.district,
          phone: restaurant.phone,
          website: restaurant.website,
          openingHours: restaurant.opening_hours,
          images: restaurant.images.map((img) => ({
            url: img.media?.url || '',
            caption: img.caption,
          })),
          offers: restaurant.offers,
        }}
      />
    </>
  );
}
