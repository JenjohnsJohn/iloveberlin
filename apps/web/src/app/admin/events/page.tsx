'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { buildEventUrl } from '@/lib/events-seo-utils';

type EventStatus = 'draft' | 'pending' | 'approved' | 'published' | 'cancelled' | 'archived';

interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  categorySlug: string;
  status: EventStatus;
  isFree: boolean;
  price: number | null;
  slug: string;
}

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-orange-100 text-orange-800',
  archived: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  published: 'Published',
  cancelled: 'Cancelled',
  archived: 'Archived',
};

function mapEvent(raw: Record<string, unknown>): EventItem {
  const venue = raw.venue as Record<string, unknown> | null;
  const category = raw.category as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    date: String(raw.start_date || raw.startDate || raw.date || ''),
    venue: String(venue?.name || raw.venue_name || raw.venueName || (typeof raw.venue === 'string' ? raw.venue : '') || ''),
    category: String(category?.name || raw.category_name || raw.categoryName || (typeof raw.category === 'string' ? raw.category : '') || ''),
    categorySlug: String(category?.slug || raw.category_slug || raw.categorySlug || ''),
    status: (raw.status as EventStatus) || 'draft',
    isFree: Boolean(raw.is_free ?? raw.isFree ?? false),
    price: raw.price != null ? Number(raw.price) : null,
    slug: String(raw.slug || ''),
  };
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const limit = 20;

  // Fetch categories for filter
  useEffect(() => {
    apiClient.get('/categories').then(({ data }) => {
      const items = Array.isArray(data) ? data : data.data ?? [];
      setCategories(
        items
          .filter((c: Record<string, unknown>) => !c.type || c.type === 'event')
          .map((c: Record<string, unknown>) => ({
            id: String(c.id ?? ''),
            name: String(c.name ?? ''),
            slug: String(c.slug ?? ''),
          }))
      );
    }).catch(() => {});
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await apiClient.get('/events/admin/list', { params });
      // Handle both { data: [...], total, page } and plain array responses
      if (Array.isArray(data)) {
        setEvents(data.map((e: Record<string, unknown>) => mapEvent(e)));
        setTotalPages(1);
      } else {
        const raw = data.data || data.events || data.items || [];
        setEvents(raw.map((e: Record<string, unknown>) => mapEvent(e)));
        const total = data.total || data.totalCount || 0;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load events';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, categoryFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/events/${id}`);
      fetchEvents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete event';
      setError(message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setError(null);
      await apiClient.patch(`/events/${id}/status`, { status: newStatus });
      await fetchEvents();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update event status';
      setError(message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Events</h2>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + New Event
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search events..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'All' },
          { value: 'draft', label: 'Draft' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'published', label: 'Published' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'archived', label: 'Archived' },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-500">Loading events...</span>
        </div>
      ) : (
        <>
          {/* Events Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Venue
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {event.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {event.date}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{event.venue}</td>
                      <td className="px-4 py-3 text-gray-600">{event.category}</td>
                      <td className="px-4 py-3">
                        <select
                          value={event.status}
                          onChange={(e) => handleStatusChange(event.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[event.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {(Object.keys(STATUS_LABELS) as EventStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            event.isFree
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {event.isFree ? 'Free' : `\u20AC${event.price}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/events/${event.slug}/edit`}
                            className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            href={buildEventUrl(event.slug, event.categorySlug)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            target="_blank"
                          >
                            View
                          </Link>
                          <button
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            onClick={() => handleDelete(event.id, event.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
