'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
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

interface LatestProductListProps {
  initialProducts: ProductListingData[];
  initialTotal: number;
}

const LIMIT = 6;

function mapProduct(p: Record<string, unknown>): ProductListingData {
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
}

export { type ProductListingData };

export function LatestProductList({ initialProducts, initialTotal }: LatestProductListProps) {
  const [products, setProducts] = useState<ProductListingData[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/store/products', {
        params: { page: nextPage, limit: LIMIT, sort: 'created', order: 'desc' },
      });
      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapProduct);
      setTotal(responseData.total ?? total);
      setPage(nextPage);
      setProducts((prev) => [...prev, ...fetched]);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [page, total]);

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
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
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${total - products.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
