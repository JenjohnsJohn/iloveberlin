'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { RestaurantCard } from '@/components/dining/restaurant-card';
import type { RestaurantCardData } from '@/components/dining/restaurant-card';
import apiClient from '@/lib/api-client';

const ALL_DISTRICT = { name: 'All Districts', value: '' };
const PRICE_RANGES = [
  { label: 'All Prices', value: '' },
  { label: '$ Budget', value: 'budget' },
  { label: '$$ Moderate', value: 'moderate' },
  { label: '$$$ Upscale', value: 'upscale' },
  { label: '$$$$ Fine Dining', value: 'fine_dining' },
];

interface CuisineContentProps {
  cuisineSlug: string;
  cuisineName: string;
}

export function CuisineContent({ cuisineSlug, cuisineName }: CuisineContentProps) {
  const [activeDistrict, setActiveDistrict] = useState('');
  const [activePriceRange, setActivePriceRange] = useState('');
  const [districts, setDistricts] = useState<{ name: string; value: string }[]>([ALL_DISTRICT]);
  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  useEffect(() => {
    apiClient.get('/dining/restaurants', { params: { limit: 200 } }).then(({ data }) => {
      const items = data.data ?? data;
      if (Array.isArray(items)) {
        const uniqueDistricts = new Set<string>();
        items.forEach((r: Record<string, unknown>) => {
          if (r.district && typeof r.district === 'string') uniqueDistricts.add(r.district);
        });
        const districtItems = Array.from(uniqueDistricts).sort().map((d) => ({ name: d, value: d }));
        setDistricts([ALL_DISTRICT, ...districtItems]);
      }
    }).catch(() => {});
  }, []);

  const fetchRestaurants = useCallback(async (pageNum: number, district: string, priceRange: string, append: boolean) => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page: pageNum, limit, cuisine: cuisineSlug };
      if (district) params.district = district;
      if (priceRange) params.price_range = priceRange;

      const { data: responseData } = await apiClient.get('/dining/restaurants', { params });
      const items = responseData.data ?? responseData;
      const fetched: RestaurantCardData[] = (Array.isArray(items) ? items : []).map(
        (r: Record<string, unknown>) => {
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
        },
      );
      const totalCount = responseData.total ?? 0;
      setTotal(totalCount);
      setHasMore(pageNum * limit < totalCount);
      if (append) {
        setRestaurants((prev) => [...prev, ...fetched]);
      } else {
        setRestaurants(fetched);
      }
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [cuisineSlug]);

  useEffect(() => {
    setPage(1);
    fetchRestaurants(1, activeDistrict, activePriceRange, false);
  }, [activeDistrict, activePriceRange, fetchRestaurants]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(nextPage, activeDistrict, activePriceRange, true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dining', href: '/dining' },
            { label: cuisineName },
          ]}
        />
      </div>

      <section className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{cuisineName}</h1>
        <p className="text-lg text-gray-600">
          Discover the best {cuisineName.toLowerCase()} restaurants in Berlin.
        </p>
      </section>

      {/* Filters */}
      <section className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0">
          <select
            value={activeDistrict}
            onChange={(e) => setActiveDistrict(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {districts.map((d) => (
              <option key={d.value} value={d.value}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-shrink-0">
          <select
            value={activePriceRange}
            onChange={(e) => setActivePriceRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {PRICE_RANGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Restaurant Grid */}
      <section>
        {loading && restaurants.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No restaurants found for this cuisine.
            </p>
          </div>
        )}
      </section>

      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More Restaurants (${total - restaurants.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
