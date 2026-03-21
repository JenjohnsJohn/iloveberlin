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

const TOPIC_EMOJI: Record<string, string> = {
  'living-in-berlin': '\u{1F3E0}',
  transportation: '\u{1F68C}',
  laws: '\u{2696}\u{FE0F}',
  culture: '\u{1F3A8}',
  'visiting-berlin': '\u{1F4F7}',
  'work-and-business': '\u{1F4BC}',
  'places-to-see': '\u{1F5FA}\u{FE0F}',
  'whos-who': '\u{1F465}',
};

const TOPIC_LABEL: Record<string, string> = {
  'living-in-berlin': 'Living in Berlin',
  transportation: 'Transportation',
  laws: 'Laws & Regulations',
  culture: 'Culture & Lifestyle',
  'visiting-berlin': 'Visiting Berlin',
  'work-and-business': 'Work & Business',
  'places-to-see': 'Places to See',
  'whos-who': "Who's Who",
};

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
        {guides.map((guide) => {
          const emoji = TOPIC_EMOJI[guide.topicSlug] || '\u{1F4D6}';
          const topicLabel = TOPIC_LABEL[guide.topicSlug] || guide.topicSlug;
          return (
            <Link
              key={guide.slug}
              href={buildGuideUrl(guide.slug, guide.topicSlug)}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-6 hover:shadow-primary-glow hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Topic Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium mb-3">
                <span>{emoji}</span>
                {topicLabel}
              </span>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                <span className="mr-1.5">{emoji}</span>
                {guide.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                {guide.excerpt}
              </p>

              {/* Meta row */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>By {guide.author}</span>
                {guide.lastReviewed && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
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

              {/* Read guide link */}
              <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                Read guide
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          );
        })}
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
