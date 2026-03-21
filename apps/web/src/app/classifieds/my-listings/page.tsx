'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';

interface MyListing {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  priceType: string;
  status: 'draft' | 'pending' | 'active' | 'expired' | 'sold';
  categorySlug: string;
  categoryName: string;
  imageUrl: string | null;
  createdAt: string;
  views: number;
  messages: number;
}

function mapListing(raw: Record<string, unknown>): MyListing {
  const category = raw.category as Record<string, unknown> | null;
  const images = raw.images as Record<string, unknown>[] | null;
  return {
    id: String(raw.id || ''),
    slug: String(raw.slug || ''),
    title: String(raw.title || ''),
    price: raw.price != null ? Number(raw.price) : null,
    priceType: String(raw.price_type || raw.priceType || 'fixed'),
    status: (raw.status as MyListing['status']) || 'draft',
    categorySlug: String(category?.slug || raw.categorySlug || ''),
    categoryName: String(category?.name || raw.categoryName || ''),
    imageUrl: images?.[0] ? String((images[0] as Record<string, unknown>).thumbnail_url || (images[0] as Record<string, unknown>).url || '') || null : null,
    createdAt: String(raw.created_at || raw.createdAt || '').split('T')[0],
    views: Number(raw.view_count || raw.views || 0),
    messages: Number(raw.message_count || raw.messages || 0),
  };
}

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'On request';
  if (price === null) return 'On request';
  return `\u20AC${price.toLocaleString('de-DE')}`;
}

function statusBadge(status: MyListing['status']): { label: string; color: string } {
  const map: Record<MyListing['status'], { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
    sold: { label: 'Sold', color: 'bg-blue-100 text-blue-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/classifieds/user/my-listings');
      const raw = Array.isArray(data) ? data : data.data || [];
      setListings(raw.map((r: Record<string, unknown>) => mapListing(r)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load listings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = listings.filter((l) => {
    if (filterStatus === 'all') return true;
    return l.status === filterStatus;
  });

  const handleMarkSold = async (id: string) => {
    try {
      await apiClient.put(`/classifieds/${id}`, { status: 'sold' });
      await fetchListings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update listing';
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/classifieds/${id}`);
      setShowDeleteConfirm(null);
      await fetchListings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete listing';
      setError(message);
    }
  };

  const handleSubmitForModeration = async (id: string) => {
    try {
      await apiClient.post(`/classifieds/${id}/submit`);
      await fetchListings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit listing';
      setError(message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/classifieds" className="hover:text-primary-600">Classifieds</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">My Listings</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Listings</h1>
            <p className="text-gray-600">Manage your classified listings.</p>
          </div>
          <Link
            href="/classifieds/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Listing
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'active', 'pending', 'draft', 'sold', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && ` (${listings.length})`}
              {status !== 'all' &&
                ` (${listings.filter((l) => l.status === status).length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-500">Loading listings...</span>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const badge = statusBadge(listing.status);
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-full sm:w-32 h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <Link
                            href={`/classifieds/${listing.categorySlug}/${listing.slug}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                          >
                            {listing.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs text-gray-400">{listing.categoryName}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary-700 whitespace-nowrap">
                          {formatPrice(listing.price, listing.priceType)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>Posted {listing.createdAt}</span>
                        <span>{listing.views} views</span>
                        <span>{listing.messages} messages</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/classifieds/${listing.categorySlug}/${listing.slug}`}
                          className="px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          View
                        </Link>
                        {listing.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitForModeration(listing.id)}
                            className="px-3 py-1.5 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            Submit for Review
                          </button>
                        )}
                        {listing.status === 'active' && (
                          <button
                            onClick={() => handleMarkSold(listing.id)}
                            className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            Mark as Sold
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteConfirm(listing.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === listing.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-sm text-red-600">Are you sure you want to delete this listing?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Start selling by creating your first classified listing</p>
            <Link
              href="/classifieds/create"
              className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-semibold"
            >
              Post Your First Listing
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings match the selected filter.</p>
            <button
              onClick={() => setFilterStatus('all')}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Show all listings
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
