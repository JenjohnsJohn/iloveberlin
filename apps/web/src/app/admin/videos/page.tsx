'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { buildVideoUrl } from '@/lib/videos-seo-utils';

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  seriesName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  videoProvider: string;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
}

interface VideoSeries {
  id: string;
  name: string;
  slug: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapVideo(raw: Record<string, unknown>): VideoItem {
  const series = raw.series as Record<string, unknown> | null;
  const category = raw.category as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    slug: String(raw.slug || ''),
    seriesName: (raw.seriesName || raw.series_name || series?.name || null) as string | null,
    categoryName: (raw.categoryName || raw.category_name || category?.name || null) as string | null,
    categorySlug: (raw.categorySlug || raw.category_slug || category?.slug || null) as string | null,
    videoProvider: String(raw.videoProvider || raw.video_provider || ''),
    status: (raw.status as 'draft' | 'published' | 'archived') || 'draft',
    viewCount: Number(raw.viewCount ?? raw.view_count ?? 0),
    publishedAt: (raw.publishedAt || raw.published_at || null) as string | null,
    createdAt: String(raw.createdAt || raw.created_at || ''),
  };
}

function mapSeries(raw: Record<string, unknown>): VideoSeries {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || raw.title || ''),
    slug: String(raw.slug || ''),
  };
}

export default function VideosAdminPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/videos/admin/list', {
        params: {
          page,
          limit,
          ...(statusFilter !== 'all' && statusFilter ? { status: statusFilter } : {}),
        },
      });
      if (Array.isArray(data)) {
        setVideos(data.map((v: Record<string, unknown>) => mapVideo(v)));
        setTotalPages(1);
      } else {
        const raw = data.data || data.videos || data.items || [];
        setVideos(raw.map((v: Record<string, unknown>) => mapVideo(v)));
        const total = data.total || data.totalCount || 0;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load videos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchSeries = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/videos/series');
      if (Array.isArray(data)) {
        setSeries(data.map((s: Record<string, unknown>) => mapSeries(s)));
      } else {
        const raw = data.data || data.series || data.items || [];
        setSeries(raw.map((s: Record<string, unknown>) => mapSeries(s)));
      }
    } catch {
      // Series are supplementary, don't block the page
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setError(null);
      await apiClient.patch(`/videos/${id}`, { status: newStatus });
      await fetchVideos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update video status';
      setError(message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/videos/${id}`);
      fetchVideos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete video';
      setError(message);
    }
  };

  // Client-side search filtering
  const filteredVideos = videos.filter((video) => {
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Videos</h2>
        <Link
          href="/admin/videos/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + Add Video
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'published', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
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
          <span className="ml-3 text-gray-500">Loading videos...</span>
        </div>
      ) : (
        <>
          {/* Videos Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Series
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {video.title}
                          </div>
                          <div className="text-xs text-gray-400">/{video.slug}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {video.seriesName || '--'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {video.categoryName || '--'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 capitalize">
                          {video.videoProvider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={video.status}
                          onChange={(e) => handleStatusChange(video.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                            STATUS_STYLES[video.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {(video.viewCount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(video.publishedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/videos/${video.slug}/edit`}
                            className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            href={buildVideoUrl(video.slug, video.categorySlug)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            target="_blank"
                          >
                            View
                          </Link>
                          <button
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            onClick={() => handleDelete(video.id, video.title)}
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

            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No videos found matching your criteria.</p>
              </div>
            )}
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

      {/* Series Overview */}
      {series.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Video Series
          </h3>
          <div className="flex flex-wrap gap-2">
            {series.map((s) => (
              <span
                key={s.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
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
