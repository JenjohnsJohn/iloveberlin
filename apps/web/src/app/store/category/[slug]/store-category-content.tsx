'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import apiClient from '@/lib/api-client';

interface ProductListingData {
  slug: string;
  name: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string;
  categorySlug: string;
  isFeatured: boolean;
}

const SORT_OPTIONS = [
  { label: 'Sort by: Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

interface StoreCategoryContentProps {
  categorySlug: string;
  categoryName: string;
}

export function StoreCategoryContent({ categorySlug, categoryName }: StoreCategoryContentProps) {
  const [products, setProducts] = useState<ProductListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [displayCount, setDisplayCount] = useState(20);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/store/products', {
        params: { limit: 100, category: categorySlug },
      });
      const items = responseData.data ?? responseData;
      const fetched: ProductListingData[] = (Array.isArray(items) ? items : []).map(
        (p: Record<string, unknown>) => {
          const images = p.images as Record<string, unknown>[] | undefined;
          const primaryImage = images?.find((img) => img.is_primary) || images?.[0];
          const category = p.category as Record<string, unknown> | null;
          return {
            slug: String(p.slug || ''),
            name: String(p.name || ''),
            shortDescription: String(p.short_description || (p.description as string)?.slice(0, 120) || ''),
            basePrice: Number(p.base_price || 0),
            compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
            imageUrl: (primaryImage?.thumbnail_url || primaryImage?.url || null) as string | null,
            category: String(category?.name || ''),
            categorySlug: String(category?.slug || ''),
            isFeatured: Boolean(p.is_featured),
          };
        },
      );
      setProducts(fetched);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const sortedProducts = useMemo(() => {
    const result = [...products];
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
        // Already sorted by newest from API
        break;
    }
    return result;
  }, [products, sortBy]);

  const visibleProducts = sortedProducts.slice(0, displayCount);

  useEffect(() => {
    setDisplayCount(20);
  }, [sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Store', href: '/store' },
            { label: categoryName },
          ]}
        />
      </div>

      <section className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <p className="text-lg text-gray-600">
          Shop {categoryName.toLowerCase()} products from Berlin.
        </p>
      </section>

      {/* Sort + Count */}
      <section className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
        </p>
        <div>
          <label htmlFor="store-sort" className="sr-only">Sort products</label>
          <select
            id="store-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Product Grid */}
      <section>
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/store/${product.slug}`}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
                        </svg>
                      </div>
                    )}
                    {product.compareAtPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</span>
                    )}
                    {product.isFeatured && !product.compareAtPrice && (
                      <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">Featured</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{'\u20AC'}{product.basePrice.toFixed(2)}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-400 line-through">{'\u20AC'}{product.compareAtPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {visibleProducts.length < sortedProducts.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Load More Products ({sortedProducts.length - visibleProducts.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
