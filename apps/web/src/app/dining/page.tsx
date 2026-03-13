'use client';

import { useState, useEffect, useCallback } from 'react';
import { RestaurantCard } from '@/components/dining/restaurant-card';
import type { RestaurantCardData } from '@/components/dining/restaurant-card';
import apiClient from '@/lib/api-client';

interface CuisineItem {
  name: string;
  slug: string;
}

const ALL_CUISINE: CuisineItem = { name: 'All', slug: '' };
const ALL_DISTRICT = { name: 'All Districts', value: '' };

const PRICE_RANGES = [
  { label: 'All Prices', value: '' },
  { label: '$ Budget', value: 'budget' },
  { label: '$$ Moderate', value: 'moderate' },
  { label: '$$$ Upscale', value: 'upscale' },
  { label: '$$$$ Fine Dining', value: 'fine_dining' },
];

export default function DiningPage() {
  const [activeCuisineSlug, setActiveCuisineSlug] = useState('');
  const [activeDistrict, setActiveDistrict] = useState('');
  const [activePriceRange, setActivePriceRange] = useState('');
  const [cuisines, setCuisines] = useState<CuisineItem[]>([ALL_CUISINE]);
  const [districts, setDistricts] = useState<{ name: string; value: string }[]>([ALL_DISTRICT]);
  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  // Fetch cuisines and districts from API
  useEffect(() => {
    apiClient.get('/dining/cuisines').then(({ data }) => {
      const items = Array.isArray(data) ? data : data.data ?? [];
      const cuisineItems: CuisineItem[] = items.map((c: Record<string, unknown>) => ({
        name: String(c.name || ''),
        slug: String(c.slug || ''),
      }));
      setCuisines([ALL_CUISINE, ...cuisineItems]);
    }).catch(() => {});

    // Fetch published restaurants and extract unique districts
    apiClient.get('/dining/restaurants', { params: { limit: 200 } }).then(({ data }) => {
      const items = data.data ?? data;
      if (Array.isArray(items)) {
        const uniqueDistricts = new Set<string>();
        items.forEach((r: Record<string, unknown>) => {
          if (r.district && typeof r.district === 'string') {
            uniqueDistricts.add(r.district);
          }
        });
        const districtItems = Array.from(uniqueDistricts).sort().map((d) => ({ name: d, value: d }));
        setDistricts([ALL_DISTRICT, ...districtItems]);
      }
    }).catch(() => {});
  }, []);

  const fetchRestaurants = useCallback(async (pageNum: number, cuisineSlug: string, district: string, priceRange: string, append: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        page: pageNum,
        limit,
      };

      if (cuisineSlug) params.cuisine = cuisineSlug;

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
      setError('Failed to load restaurants. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchRestaurants(1, activeCuisineSlug, activeDistrict, activePriceRange, false);
  }, [activeCuisineSlug, activeDistrict, activePriceRange, fetchRestaurants]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(nextPage, activeCuisineSlug, activeDistrict, activePriceRange, true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Berlin Dining
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the best restaurants, cafes, and eateries Berlin has to
          offer. From street food to fine dining, explore the city&apos;s vibrant
          culinary scene.
        </p>
      </section>

      {/* Cuisine Tabs */}
      <section className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {cuisines.map((c) => (
            <button
              key={c.slug}
              onClick={() => { setActiveCuisineSlug(c.slug); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCuisineSlug === c.slug
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Filters Row */}
      <section className="mb-8 flex flex-col md:flex-row gap-4">
        {/* District Dropdown */}
        <div className="flex-shrink-0">
          <select
            value={activeDistrict}
            onChange={(e) => { setActiveDistrict(e.target.value); }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {districts.map((d) => (
              <option key={d.value} value={d.value}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Dropdown */}
        <div className="flex-shrink-0">
          <select
            value={activePriceRange}
            onChange={(e) => { setActivePriceRange(e.target.value); }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {PRICE_RANGES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Restaurant Grid */}
      <section>
        {error && !loading && restaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">{error}</p>
          </div>
        ) : loading && restaurants.length === 0 ? (
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
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              No restaurants found matching your filters.
            </p>
            <button
              onClick={() => {
                setActiveCuisineSlug('');
                setActiveDistrict('');
                setActivePriceRange('');
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Load More */}
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
