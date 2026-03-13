'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

type CompetitionStatus = 'draft' | 'active' | 'closed' | 'archived';

interface Competition {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: CompetitionStatus;
  entryCount: number;
  maxEntries: number | null;
  winner: string | null;
  slug: string;
}

const STATUS_STYLES: Record<CompetitionStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  archived: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<CompetitionStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
  archived: 'Archived',
};

function mapCompetition(raw: Record<string, unknown>): Competition {
  const winner = raw.winner as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    startDate: String(raw.start_date || raw.startDate || ''),
    endDate: String(raw.end_date || raw.endDate || ''),
    status: (raw.status as CompetitionStatus) || 'draft',
    entryCount: Number(raw.entry_count ?? raw.entryCount ?? 0),
    maxEntries: raw.max_entries != null ? Number(raw.max_entries) : (raw.maxEntries != null ? Number(raw.maxEntries) : null),
    winner: (winner?.display_name || winner?.name || winner?.username || raw.winner_name || (typeof raw.winner === 'string' ? raw.winner : null)) as string | null,
    slug: String(raw.slug || ''),
  };
}

export default function CompetitionsAdminPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CompetitionStatus | 'all'>(
    'all',
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = statusFilter === 'all' ? undefined : statusFilter;
      const { data } = await apiClient.get('/competitions/admin/list', {
        params: { page, limit, ...(statusParam ? { status: statusParam } : {}) },
      });
      const raw = Array.isArray(data) ? data : data.data ?? [];
      const items = raw.map((c: Record<string, unknown>) => mapCompetition(c));
      setCompetitions(items);
      setTotal(data.total ?? items.length);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load competitions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this competition?')) return;
    try {
      setError(null);
      await apiClient.delete(`/competitions/${id}`);
      await fetchCompetitions();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete competition';
      setError(message);
    }
  };

  const handlePickWinner = async (id: string) => {
    if (!window.confirm('Are you sure you want to select a winner for this competition?')) return;
    try {
      setError(null);
      await apiClient.post(`/competitions/${id}/select-winner`);
      await fetchCompetitions();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to select winner';
      setError(message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setError(null);
      await apiClient.patch(`/competitions/${id}`, { status: newStatus });
      await fetchCompetitions();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update competition status';
      setError(message);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompetitions = competitions.filter((c) => {
    if (!searchQuery) return true;
    return c.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Competitions</h2>
        <Link
          href="/admin/competitions/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + New Competition
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search competitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'draft', 'active', 'closed', 'archived'] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ),
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Competitions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Start Date
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      End Date
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Entries
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Winner
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetitions.map((comp) => (
                    <tr
                      key={comp.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {comp.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {comp.startDate || '--'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {comp.endDate || '--'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={comp.status}
                          onChange={(e) => handleStatusChange(comp.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[comp.status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {comp.entryCount}
                        {comp.maxEntries ? ` / ${comp.maxEntries}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        {comp.winner ? (
                          <span className="text-green-700 font-medium">
                            {comp.winner}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/competitions/${comp.slug}/edit`}
                            className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/competitions/${comp.slug}`}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            target="_blank"
                          >
                            View
                          </Link>
                          {(comp.status === 'active' || comp.status === 'closed') &&
                            !comp.winner && (
                              <button
                                onClick={() => handlePickWinner(comp.id)}
                                className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition-colors"
                              >
                                Pick Winner
                              </button>
                            )}
                          <button
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            onClick={() => handleDelete(comp.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCompetitions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No competitions found for the selected filter.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Total Competitions</div>
              <div className="text-2xl font-bold text-gray-900">
                {total}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {competitions.filter((c) => c.status === 'active').length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Total Entries</div>
              <div className="text-2xl font-bold text-primary-600">
                {competitions.reduce((sum, c) => sum + c.entryCount, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Winners Selected</div>
              <div className="text-2xl font-bold text-amber-600">
                {competitions.filter((c) => c.winner).length}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
