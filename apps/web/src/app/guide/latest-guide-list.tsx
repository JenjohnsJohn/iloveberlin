'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { buildGuideUrl } from '@/lib/guide-seo-utils';
import apiClient from '@/lib/api-client';
import { formatDate } from '@/lib/format-date';

interface GuideCardData {
  slug: string;
  title: string;
  excerpt: string;
  lastReviewed: string | null;
  author: string;
  topicSlug: string;
}

interface LatestGuideListProps {
  initialGuides: GuideCardData[];
  initialTotal: number;
}

const LIMIT = 6;


function mapGuide(g: Record<string, unknown>): GuideCardData {
  const author = g.author as Record<string, unknown> | null;
  const topic = g.topic as Record<string, unknown> | null;
  return {
    slug: String(g.slug || ''),
    title: String(g.title || ''),
    excerpt: String(g.excerpt || ''),
    lastReviewed: (g.last_reviewed_at || g.lastReviewed || null) as string | null,
    author: String(
      author?.display_name || author?.name || author?.username ||
      g.author_name || (typeof g.author === 'string' ? g.author : '') || 'Staff Writer'
    ),
    topicSlug: String(topic?.slug || g.topic_slug || ''),
  };
}

export { type GuideCardData };

export function LatestGuideList({ initialGuides, initialTotal }: LatestGuideListProps) {
  const [guides, setGuides] = useState<GuideCardData[]>(initialGuides);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/guides', {
        params: { page: nextPage, limit: LIMIT, sort: 'date', order: 'desc' },
      });
      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapGuide);
      setTotal(responseData.total ?? total);
      setPage(nextPage);
      setGuides((prev) => [...prev, ...fetched]);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [page, total]);

  if (guides.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Latest Guides</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={buildGuideUrl(guide.slug, guide.topicSlug)}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
              {guide.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
              {guide.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>By {guide.author}</span>
              {guide.lastReviewed && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Reviewed {formatDate(guide.lastReviewed)}
                </span>
              )}
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
            {loading ? 'Loading...' : `Load More (${total - guides.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
