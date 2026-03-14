'use client';

import { useState, useCallback } from 'react';
import { RestaurantCard } from '@/components/dining/restaurant-card';
import type { RestaurantCardData } from '@/components/dining/restaurant-card';
import apiClient from '@/lib/api-client';

interface LatestRestaurantListProps {
  initialRestaurants: RestaurantCardData[];
  initialTotal: number;
}

const LIMIT = 6;

function mapRestaurant(r: Record<string, unknown>): RestaurantCardData {
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
}

export function LatestRestaurantList({ initialRestaurants, initialTotal }: LatestRestaurantListProps) {
  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>(initialRestaurants);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/dining/restaurants', {
        params: { page: nextPage, limit: LIMIT, sort: 'created', order: 'desc' },
      });
      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapRestaurant);
      setTotal(responseData.total ?? total);
      setPage(nextPage);
      setRestaurants((prev) => [...prev, ...fetched]);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [page, total]);

  if (restaurants.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Restaurants</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${total - restaurants.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
