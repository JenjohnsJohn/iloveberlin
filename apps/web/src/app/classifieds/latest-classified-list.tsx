'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { ClassifiedListingData } from './page';
import apiClient from '@/lib/api-client';

interface LatestClassifiedListProps {
  initialListings: ClassifiedListingData[];
  initialTotal: number;
}

const LIMIT = 6;

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'Price on request';
  if (price === null) return 'Price on request';
  return `\u20AC${price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatCondition(condition: string | null): string | null {
  if (!condition) return null;
  const map: Record<string, string> = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };
  return map[condition] || condition;
}

function mapClassified(c: Record<string, unknown>): ClassifiedListingData {
  const category = c.category as Record<string, unknown> | null;
  const images = c.images as Record<string, unknown>[] | null;
  return {
    slug: String(c.slug || ''),
    title: String(c.title || ''),
    price: (c.price ?? null) as number | null,
    priceType: String(c.price_type || ''),
    condition: (c.condition || null) as string | null,
    location: (c.location || null) as string | null,
    district: (c.district || null) as string | null,
    category: String(category?.name || ''),
    categorySlug: String(category?.slug || ''),
    imageUrl: (images?.[0]?.thumbnail_url || images?.[0]?.url || null) as string | null,
    createdAt: ((c.created_at as string)?.split('T')[0] || '') as string,
    featured: Boolean(c.featured),
  };
}

export function LatestClassifiedList({ initialListings, initialTotal }: LatestClassifiedListProps) {
  const [listings, setListings] = useState<ClassifiedListingData[]>(initialListings);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/classifieds', {
        params: { page: nextPage, limit: LIMIT, sort: 'date', order: 'desc' },
      });
      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapClassified);
      setTotal(responseData.total ?? total);
      setPage(nextPage);
      setListings((prev) => [...prev, ...fetched]);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [page, total]);

  if (listings.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Latest Listings</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Link
            key={listing.slug}
            href={`/classifieds/${listing.categorySlug}/${listing.slug}`}
            className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
              {listing.imageUrl ? (
                <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                </div>
              )}
              {listing.featured && <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">Featured</span>}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">{listing.title}</h3>
              <div className="text-xl font-bold text-primary-700 mb-2">{formatPrice(listing.price, listing.priceType)}</div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="truncate">{listing.location}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                {listing.condition ? <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{formatCondition(listing.condition)}</span> : <span />}
                <span className="text-xs text-gray-400">{listing.createdAt}</span>
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
            {loading ? 'Loading...' : `Load More (${total - listings.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
