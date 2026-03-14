'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

type Tab = 'pending' | 'all' | 'reports';

type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'expired' | 'sold' | 'deleted';

interface AdminListing {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  priceType: string;
  category: string;
  categorySlug: string;
  seller: string;
  district: string;
  status: ListingStatus;
  createdAt: string;
  moderatorNote: string;
}

interface Report {
  id: string;
  listingId: string;
  listingTitle: string;
  reason: string;
  reporter: string;
  reportDate: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  details: string;
}

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'On request';
  if (price === null) return 'On request';
  return `\u20AC${price.toLocaleString('de-DE')}`;
}

function statusBadge(status: ListingStatus): { label: string; color: string } {
  const map: Record<ListingStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600' },
    sold: { label: 'Sold', color: 'bg-blue-100 text-blue-700' },
    deleted: { label: 'Deleted', color: 'bg-red-100 text-red-600' },
  };
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
}

function reportStatusBadge(status: Report['status']): { label: string; color: string } {
  const map: Record<Report['status'], { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700' },
    dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-600' },
  };
  return map[status];
}

function mapListing(raw: Record<string, unknown>): AdminListing {
  const category = raw.category as Record<string, unknown> | null;
  const user = (raw.user ?? raw.seller) as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    slug: String(raw.slug || ''),
    title: String(raw.title || ''),
    price: raw.price != null ? Number(raw.price) : null,
    priceType: String(raw.price_type || raw.priceType || 'fixed'),
    category: String(category?.name || raw.category_name || (typeof raw.category === 'string' ? raw.category : '') || ''),
    categorySlug: String(category?.slug || raw.category_slug || (typeof raw.categorySlug === 'string' ? raw.categorySlug : '') || ''),
    seller: String(user?.display_name || user?.name || user?.username || raw.seller_name || (typeof raw.seller === 'string' ? raw.seller : '') || ''),
    district: String(raw.district || ''),
    status: (raw.status as ListingStatus) || 'pending',
    createdAt: String(raw.created_at || raw.createdAt || ''),
    moderatorNote: String(raw.moderator_note || raw.moderatorNote || raw.moderator_notes || ''),
  };
}

function mapReport(raw: Record<string, unknown>): Report {
  const listing = (raw.classified ?? raw.listing) as Record<string, unknown> | null;
  const reporter = raw.reporter as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    listingId: String(raw.classified_id || raw.listing_id || raw.listingId || listing?.id || ''),
    listingTitle: String(listing?.title || raw.listing_title || raw.listingTitle || ''),
    reason: String(raw.reason || ''),
    reporter: String(reporter?.display_name || reporter?.name || reporter?.username || raw.reporter_name || (typeof raw.reporter === 'string' ? raw.reporter : '') || ''),
    reportDate: String(raw.created_at || raw.createdAt || raw.report_date || raw.reportDate || ''),
    status: (raw.status as Report['status']) || 'pending',
    details: String(raw.details || raw.description || ''),
  };
}

export default function ClassifiedsAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [moderatorNotes, setModeratorNotes] = useState<Record<string, string>>({});
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters for "All Listings" tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  const fetchListings = useCallback(async () => {
    try {
      setLoadingListings(true);
      setError(null);
      const params: Record<string, string | number> = { page, limit };
      if (activeTab === 'pending') {
        params.status = 'pending';
      } else {
        if (filterStatus) params.status = filterStatus;
        if (filterCategory) params.category = filterCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();
      }
      const { data } = await apiClient.get('/classifieds/admin/list', { params });
      const raw = Array.isArray(data) ? data : data.data ?? [];
      const items = raw.map((l: Record<string, unknown>) => mapListing(l));
      setListings(items);
      setTotal(data.total ?? items.length);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load classifieds';
      setError(message);
    } finally {
      setLoadingListings(false);
    }
  }, [activeTab, page, filterStatus, filterCategory, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/classifieds/categories');
      const cats = Array.isArray(data) ? data : data.data ?? [];
      setCategories(cats.map((c: Record<string, unknown>) => ({
        name: String(c.name || ''),
        slug: String(c.slug || ''),
      })));
    } catch {
      // non-critical
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      setError(null);
      const { data } = await apiClient.get('/classifieds/admin/reports');
      const rawReports = Array.isArray(data) ? data : data.data ?? [];
      setReports(rawReports.map((r: Record<string, unknown>) => mapReport(r)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load reports';
      setError(message);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchListings();
    }
  }, [activeTab, fetchListings, fetchReports]);

  const handleApprove = async (id: string) => {
    try {
      setError(null);
      await apiClient.put(`/classifieds/${id}/moderate`, {
        action: 'approve',
        moderator_notes: moderatorNotes[id] || '',
      });
      await fetchListings();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to approve listing';
      setError(message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setError(null);
      await apiClient.put(`/classifieds/${id}/moderate`, {
        action: 'reject',
        moderator_notes: moderatorNotes[id] || '',
      });
      await fetchListings();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to reject listing';
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this classified?')) return;
    try {
      setError(null);
      await apiClient.delete(`/classifieds/${id}`);
      await fetchListings();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete classified';
      setError(message);
    }
  };

  const handleDismissReport = async (id: string) => {
    try {
      setError(null);
      await apiClient.put(`/classifieds/admin/reports/${id}`, {
        status: 'dismissed',
      });
      await fetchReports();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to dismiss report';
      setError(message);
    }
  };

  const handleReviewReport = async (id: string) => {
    try {
      setError(null);
      await apiClient.put(`/classifieds/admin/reports/${id}`, {
        status: 'reviewed',
      });
      await fetchReports();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to review report';
      setError(message);
    }
  };

  const pendingListings = listings.filter((l) => l.status === 'pending');

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending Moderation', count: pendingListings.length },
    { key: 'all', label: 'All Listings', count: total },
    { key: 'reports', label: 'Reports', count: reports.filter((r) => r.status === 'pending').length },
  ];

  const isLoading = activeTab === 'reports' ? loadingReports : loadingListings;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Classifieds Management</h2>
        <Link
          href="/classifieds"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View Public Page
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Pending Moderation Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingListings.length > 0 ? (
                pendingListings.map((listing) => {
                  const badge = statusBadge(listing.status);
                  return (
                    <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Listing Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">{listing.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                                <span>{listing.category}</span>
                                <span>-</span>
                                <span>{listing.district}</span>
                                <span>-</span>
                                <span>by {listing.seller}</span>
                              </div>
                            </div>
                            <span className="text-base font-bold text-primary-700 whitespace-nowrap ml-4">
                              {formatPrice(listing.price, listing.priceType)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-medium ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span>Submitted {listing.createdAt}</span>
                          </div>

                          {/* Moderator Notes */}
                          <textarea
                            placeholder="Add moderator notes (optional)..."
                            value={moderatorNotes[listing.id] || ''}
                            onChange={(e) =>
                              setModeratorNotes((prev) => ({ ...prev, [listing.id]: e.target.value }))
                            }
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex lg:flex-col gap-2 lg:justify-start flex-shrink-0">
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="px-3.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(listing.id)}
                            className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">All caught up!</h3>
                  <p className="text-sm text-gray-500">No listings are waiting for moderation.</p>
                </div>
              )}
            </div>
          )}

          {/* All Listings Tab */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="sold">Sold</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                {(searchQuery || filterStatus || filterCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('');
                      setFilterCategory('');
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Title</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Seller</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Price</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => {
                      const badge = statusBadge(listing.status);
                      return (
                        <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <span className="font-medium text-gray-900 line-clamp-1">{listing.title}</span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{listing.category}</td>
                          <td className="px-3 py-2 text-gray-600">{listing.seller}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {formatPrice(listing.price, listing.priceType)}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500">{listing.createdAt}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              {listing.categorySlug && listing.slug && (
                                <Link
                                  href={`/classifieds/${listing.categorySlug}/${listing.slug}`}
                                  className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                                >
                                  View
                                </Link>
                              )}
                              <button
                                onClick={() => handleDelete(listing.id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {Math.ceil(total / limit) > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const badge = reportStatusBadge(report.status);
                  return (
                    <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">{report.listingTitle}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                  {badge.label}
                                </span>
                                <span className="text-xs text-gray-400">Reported {report.reportDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Reason: </span>
                              <span className="font-medium text-gray-700">{report.reason}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Reporter: </span>
                              <span className="text-gray-700">{report.reporter}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Details: </span>
                              <span className="text-gray-700">{report.details}</span>
                            </div>
                          </div>
                        </div>

                        {report.status === 'pending' && (
                          <div className="flex lg:flex-col gap-2 lg:justify-start flex-shrink-0">
                            <button
                              onClick={() => handleReviewReport(report.id)}
                              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleDismissReport(report.id)}
                              className="px-3.5 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No reports to display.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
