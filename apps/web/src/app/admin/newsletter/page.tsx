'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { formatDate } from '@/lib/format-date';

interface Subscriber {
  id: string;
  email: string;
  is_confirmed: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface Stats {
  total: number;
  confirmed: number;
  unconfirmed: number;
  unsubscribed: number;
}

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const limit = 20;

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/admin/newsletter/stats');
      setStats(data);
    } catch {
      // Stats are non-critical; silently ignore
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/admin/newsletter/subscribers', {
        params: {
          page,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      setSubscribers(data.data ?? []);
      const total = data.total ?? 0;
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load subscribers';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await apiClient.delete(`/admin/newsletter/subscribers/${id}`);
      setDeleteConfirm(null);
      await fetchSubscribers();
      await fetchStats();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete subscriber';
      setError(message);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await apiClient.get('/admin/newsletter/export', {
        params: { status: statusFilter || undefined },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to export subscribers';
      setError(message);
    }
  };

  const getStatusLabel = (subscriber: Subscriber): string => {
    if (subscriber.unsubscribed_at) return 'Unsubscribed';
    if (subscriber.is_confirmed) return 'Confirmed';
    return 'Pending';
  };

  const getStatusStyle = (subscriber: Subscriber): string => {
    if (subscriber.unsubscribed_at) return 'bg-gray-100 text-gray-600';
    if (subscriber.is_confirmed) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const confirmedPercent =
    stats && stats.total > 0
      ? Math.round((stats.confirmed / stats.total) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Newsletter Subscribers
        </h2>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {stats.confirmed}{' '}
              <span className="text-sm font-normal text-gray-500">
                ({confirmedPercent}%)
              </span>
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {stats.unconfirmed}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Unsubscribed</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {stats.unsubscribed}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar: Search, Filter, Export */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search email..."
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        >
          <option value="">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="unconfirmed">Unconfirmed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <button
          onClick={handleExport}
          className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-6 w-6 text-primary-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-gray-500">Loading subscribers...</span>
        </div>
      ) : (
        <>
          {/* Subscribers Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">
                    Subscribed
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-700">
                    Unsubscribed
                  </th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2 text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(subscriber)}`}
                      >
                        {getStatusLabel(subscriber)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                      {formatDate(subscriber.subscribed_at)}
                    </td>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                      {formatDate(subscriber.unsubscribed_at) || '\u2014'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {deleteConfirm === subscriber.id ? (
                        <span className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleDelete(subscriber.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(subscriber.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No subscribers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
