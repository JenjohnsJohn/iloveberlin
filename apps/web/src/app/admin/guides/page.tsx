'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { buildGuideUrl } from '@/lib/guide-seo-utils';

type GuideStatus = 'draft' | 'in_review' | 'published' | 'archived';

interface GuideRow {
  id: string;
  slug: string;
  title: string;
  topic: string;
  topicSlug: string;
  status: GuideStatus;
  author: string;
  lastReviewed: string;
  updatedAt: string;
}

interface GuideTopic {
  id: string;
  name: string;
  slug: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  published: 'Published',
  archived: 'Archived',
};

function mapGuide(raw: Record<string, unknown>): GuideRow {
  const topic = raw.topic as Record<string, unknown> | null;
  const author = raw.author as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    slug: String(raw.slug || ''),
    title: String(raw.title || ''),
    topic: String(topic?.name || raw.topic_name || (typeof raw.topic === 'string' ? raw.topic : '') || ''),
    topicSlug: String(topic?.slug || raw.topic_slug || ''),
    status: (raw.status as GuideStatus) || 'draft',
    author: String(author?.display_name || author?.name || author?.username || raw.author_name || (typeof raw.author === 'string' ? raw.author : '') || ''),
    lastReviewed: String(raw.lastReviewed || raw.last_reviewed_at || ''),
    updatedAt: String(raw.updatedAt || raw.updated_at || ''),
  };
}

function mapTopic(raw: Record<string, unknown>): GuideTopic {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
  };
}

export default function GuidesAdminPage() {
  const [guides, setGuides] = useState<GuideRow[]>([]);
  const [topics, setTopics] = useState<GuideTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/guides/admin/list', {
        params: {
          page,
          limit,
          ...(statusFilter !== 'all' && statusFilter ? { status: statusFilter } : {}),
          topic: topicFilter,
        },
      });
      if (Array.isArray(data)) {
        setGuides(data.map((g: Record<string, unknown>) => mapGuide(g)));
        setTotalPages(1);
      } else {
        const raw = data.data || data.guides || data.items || [];
        setGuides(raw.map((g: Record<string, unknown>) => mapGuide(g)));
        const total = data.total || data.totalCount || 0;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load guides';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, topicFilter]);

  const fetchTopics = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/guides/topics');
      if (Array.isArray(data)) {
        setTopics(data.map((t: Record<string, unknown>) => mapTopic(t)));
      } else {
        const raw = data.data || data.topics || data.items || [];
        setTopics(raw.map((t: Record<string, unknown>) => mapTopic(t)));
      }
    } catch {
      // Topics are supplementary, don't block the page
    }
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setError(null);
      await apiClient.patch(`/guides/${id}`, { status: newStatus });
      await fetchGuides();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update guide status';
      setError(message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/guides/${id}`);
      fetchGuides();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete guide';
      setError(message);
    }
  };

  // Client-side search filtering (search is local since API may not support text search)
  const filteredGuides = guides.filter((guide) => {
    if (searchQuery === '') return true;
    return (
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Compute stats from the full guides list
  const totalCount = guides.length;
  const publishedCount = guides.filter((g) => g.status === 'published').length;
  const draftCount = guides.filter((g) => g.status === 'draft').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Guides</h2>
        <Link
          href="/admin/guides/new"
          className="px-3.5 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          + New Guide
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
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
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        {topics.length > 0 && (
          <select
            value={topicFilter}
            onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.slug || t.name}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Guides</p>
          <p className="text-xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-xl font-bold text-green-600">
            {publishedCount}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-xl font-bold text-yellow-600">
            {draftCount}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-500">Loading guides...</span>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Title
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Topic
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Author
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Last Reviewed
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      Updated
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuides.map((guide) => (
                    <tr
                      key={guide.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <span className="font-medium text-gray-900">
                          {guide.title}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{guide.topic}</td>
                      <td className="px-3 py-2">
                        <select
                          value={guide.status}
                          onChange={(e) => handleStatusChange(guide.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[guide.status] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{guide.author}</td>
                      <td className="px-3 py-2 text-gray-500">
                        {guide.lastReviewed || '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{guide.updatedAt}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/guides/${guide.slug}/edit`}
                            className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            href={buildGuideUrl(guide.slug, guide.topicSlug)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            target="_blank"
                          >
                            View
                          </Link>
                          <button
                            className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            onClick={() => handleDelete(guide.id, guide.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredGuides.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        No guides found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
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

      {/* Back link */}
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
