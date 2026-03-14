'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { formatDateShort, toISODate } from '@/lib/format-date';

// ── Types ────────────────────────────────────────────────────

interface DailyStats {
  date: string;
  page_views: number;
  unique_visitors: number;
  new_users: number;
  articles_published: number;
  events_created: number;
  search_queries: number;
}

interface TopPage {
  path: string;
  views: number;
  unique_visitors: number;
}

interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

interface SearchTrend {
  term: string;
  count: number;
  trend: string;
}

// ── Helpers ──────────────────────────────────────────────────


function getDefaultDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { start: toISODate(start), end: toISODate(end) };
}

function getTrendIcon(trend: string) {
  const t = trend.toLowerCase();
  if (t === 'up' || t === 'rising') {
    return (
      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l7.5-7.5 7.5 7.5" />
      </svg>
    );
  }
  if (t === 'down' || t === 'falling') {
    return (
      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function getTrendLabel(trend: string): string {
  const t = trend.toLowerCase();
  if (t === 'up' || t === 'rising') return 'Trending up';
  if (t === 'down' || t === 'falling') return 'Trending down';
  return 'Stable';
}

// ── Skeleton Components ──────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="h-4 w-28 bg-gray-200 rounded" />
      <div className="h-8 w-20 bg-gray-200 rounded mt-2" />
    </div>
  );
}

function TableSkeleton({ title, rows = 5 }: { title: string; rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="h-5 w-36 bg-gray-200 rounded" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error Banner ─────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-700 hover:text-red-900 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ── Main Analytics Page ──────────────────────────────────────

export default function AdminAnalyticsPage() {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  // Daily stats
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // Top pages
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [topPagesLoading, setTopPagesLoading] = useState(true);
  const [topPagesError, setTopPagesError] = useState<string | null>(null);

  // Traffic sources
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [trafficError, setTrafficError] = useState<string | null>(null);

  // Search trends
  const [searchTrends, setSearchTrends] = useState<SearchTrend[]>([]);
  const [searchLoading, setSearchLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ── Compute days between dates ───────────────────────────
  function getDaysBetween(): number {
    const s = new Date(startDate);
    const e = new Date(endDate);
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }

  // ── Fetch Functions ────────────────────────────────────────

  const fetchDailyStats = async () => {
    setDailyLoading(true);
    setDailyError(null);
    try {
      const res = await apiClient.get('/admin/analytics/daily', {
        params: { start: startDate, end: endDate },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setDailyStats(data);
    } catch (err) {
      console.error('Failed to load daily stats:', err);
      setDailyError('Failed to load daily analytics. Please try again.');
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchTopPages = async () => {
    setTopPagesLoading(true);
    setTopPagesError(null);
    try {
      const res = await apiClient.get('/admin/analytics/top-pages', {
        params: { days: getDaysBetween() },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setTopPages(data.slice(0, 10));
    } catch (err) {
      console.error('Failed to load top pages:', err);
      setTopPagesError('Failed to load top pages data.');
    } finally {
      setTopPagesLoading(false);
    }
  };

  const fetchTrafficSources = async () => {
    setTrafficLoading(true);
    setTrafficError(null);
    try {
      const res = await apiClient.get('/admin/analytics/traffic-sources', {
        params: { days: getDaysBetween() },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setTrafficSources(data);
    } catch (err) {
      console.error('Failed to load traffic sources:', err);
      setTrafficError('Failed to load traffic sources data.');
    } finally {
      setTrafficLoading(false);
    }
  };

  const fetchSearchTrends = async () => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await apiClient.get('/admin/analytics/search-trends', {
        params: { days: getDaysBetween() },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setSearchTrends(data);
    } catch (err) {
      console.error('Failed to load search trends:', err);
      setSearchError('Failed to load search trends data.');
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchAll = () => {
    fetchDailyStats();
    fetchTopPages();
    fetchTrafficSources();
    fetchSearchTrends();
  };

  // ── Initial Load & Refetch on Date Change ──────────────────
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // ── Computed Summaries ─────────────────────────────────────
  const totalPageViews = dailyStats.reduce((sum, d) => sum + (d.page_views ?? 0), 0);
  const totalUniqueVisitors = dailyStats.reduce((sum, d) => sum + (d.unique_visitors ?? 0), 0);
  const totalNewUsers = dailyStats.reduce((sum, d) => sum + (d.new_users ?? 0), 0);

  return (
    <div>
      {/* Header with Date Range Selector */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Site traffic and engagement metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <label className="text-sm text-gray-600">to</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {dailyLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : dailyError ? (
          <div className="col-span-3">
            <ErrorBanner message={dailyError} onRetry={fetchDailyStats} />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Total Page Views</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{totalPageViews.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Unique Visitors</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{totalUniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">New Users</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{totalNewUsers.toLocaleString()}</p>
            </div>
          </>
        )}
      </div>

      {/* Daily Stats Table */}
      <div className="mb-5">
        {dailyError && !dailyLoading && (
          <ErrorBanner message={dailyError} onRetry={fetchDailyStats} />
        )}
        {dailyLoading ? (
          <TableSkeleton title="Daily Stats" rows={7} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Daily Stats</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Date</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Page Views</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Unique Visitors</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">New Users</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No daily stats available for this date range.
                      </td>
                    </tr>
                  ) : (
                    dailyStats.map((row) => (
                      <tr
                        key={row.date}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-2 text-gray-900 font-medium">{formatDateShort(row.date)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{(row.page_views ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{(row.unique_visitors ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{(row.new_users ?? 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Top Pages & Traffic Sources side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Top Pages */}
        <div>
          {topPagesError && !topPagesLoading && (
            <ErrorBanner message={topPagesError} onRetry={fetchTopPages} />
          )}
          {topPagesLoading ? (
            <TableSkeleton title="Top Pages" rows={5} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Top Pages</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">#</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Path</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-700">Views</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-700">Unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No top pages data available.
                        </td>
                      </tr>
                    ) : (
                      topPages.map((page, index) => (
                        <tr
                          key={page.path}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2 text-gray-900 font-medium truncate max-w-[200px]" title={page.path}>
                            {page.path}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">{(page.views ?? 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{(page.unique_visitors ?? 0).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div>
          {trafficError && !trafficLoading && (
            <ErrorBanner message={trafficError} onRetry={fetchTrafficSources} />
          )}
          {trafficLoading ? (
            <TableSkeleton title="Traffic Sources" rows={5} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Traffic Sources</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 font-semibold text-gray-700">Source</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-700">Visits</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-700 w-1/3">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficSources.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          No traffic source data available.
                        </td>
                      </tr>
                    ) : (
                      trafficSources.map((source) => (
                        <tr
                          key={source.source}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2 text-gray-900 font-medium">{source.source}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{(source.visits ?? 0).toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${Math.min(source.percentage ?? 0, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-10 text-right">
                                {(source.percentage ?? 0).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Trends */}
      <div className="mb-5">
        {searchError && !searchLoading && (
          <ErrorBanner message={searchError} onRetry={fetchSearchTrends} />
        )}
        {searchLoading ? (
          <TableSkeleton title="Search Trends" rows={5} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Search Trends</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">#</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Search Term</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Count</th>
                    <th className="text-center px-3 py-2 font-semibold text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {searchTrends.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No search trend data available.
                      </td>
                    </tr>
                  ) : (
                    searchTrends.map((item, index) => (
                      <tr
                        key={item.term}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2 text-gray-900 font-medium">{item.term}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{(item.count ?? 0).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1.5" title={getTrendLabel(item.trend)}>
                            {getTrendIcon(item.trend)}
                            <span className="text-xs text-gray-500">{getTrendLabel(item.trend)}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
