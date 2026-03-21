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
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Latest Products</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/store/${product.slug}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-primary-300">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
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
        <div className="text-center mt-6">
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
