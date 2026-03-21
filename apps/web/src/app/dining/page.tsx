import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toDiningCuisineSeoSlug } from '@/lib/dining-seo-utils';
import { LatestRestaurantList } from './latest-restaurant-list';
import type { RestaurantCardData } from '@/components/dining/restaurant-card';
import { API_URL, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Berlin Dining',
  description:
    'Discover the best restaurants, cafes, and eateries Berlin has to offer. From street food to fine dining, explore the city\'s vibrant culinary scene.',
  alternates: {
    canonical: `${SITE_URL}/dining`,
  },
};

async function getCuisines(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/dining/cuisines/tree`, {
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
    console.error('Failed to load cuisines:', err);
  }
  return [];
}

async function getLatestRestaurants(): Promise<{ restaurants: RestaurantCardData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/dining/restaurants?limit=6&sort=created&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const restaurants = (items as Record<string, unknown>[]).map((r) => {
        const cuisines = r.cuisines as Record<string, unknown>[] | undefined;
        const featuredImage = r.featured_image as Record<string, unknown> | null;
        return {
          slug: (r.slug || '') as string,
          name: (r.name || '') as string,
          description: ((r.description || '') as string).replace(/<[^>]*>/g, '').slice(0, 200),
          featuredImage: (featuredImage?.url || r.featuredImage || null) as string | null,
          cuisines: Array.isArray(cuisines) ? cuisines.map((c) => String(c.name || c)) : [],
          primaryCuisineSlug: Array.isArray(cuisines) && cuisines.length > 0 ? String(cuisines[0].slug || '') : null,
          priceRange: (r.price_range || r.priceRange || 'moderate') as RestaurantCardData['priceRange'],
          rating: (r.rating ?? null) as number | null,
          district: (r.district || null) as string | null,
        };
      });
      return { restaurants, total };
    }
  } catch (err) {
    console.error('Failed to load latest restaurants:', err);
  }
  return { restaurants: [], total: 0 };
}

export default async function DiningPage() {
  const [cuisines, { restaurants: latestRestaurants, total: restaurantsTotal }] = await Promise.all([
    getCuisines(),
    getLatestRestaurants(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-4">
          <svg className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Berlin Dining
        </h1>
        <div className="w-12 h-1 bg-orange-500 rounded-full mx-auto mb-3" />
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Discover the best restaurants, cafes, and eateries Berlin has to
          offer. From street food to fine dining, explore the city&apos;s vibrant
          culinary scene.
        </p>
      </section>

      {/* Cuisine Grid */}
      <section>
        <CategoryGrid
          categories={cuisines}
          basePath="/dining"
          slugTransform={toDiningCuisineSeoSlug}
          emptyMessage="No cuisines available yet. Check back soon!"
        />
      </section>

      <LatestRestaurantList initialRestaurants={latestRestaurants} initialTotal={restaurantsTotal} />
    </div>
  );
}
