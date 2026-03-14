import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toDiningCuisineSeoSlug } from '@/lib/dining-seo-utils';
import { LatestRestaurantList } from './latest-restaurant-list';
import type { RestaurantCardData } from '@/components/dining/restaurant-card';

export const metadata: Metadata = {
  title: 'Berlin Dining',
  description:
    'Discover the best restaurants, cafes, and eateries Berlin has to offer. From street food to fine dining, explore the city\'s vibrant culinary scene.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Berlin Dining
        </h1>
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
