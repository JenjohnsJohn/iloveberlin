'use client';

import { useState, useCallback, useRef } from 'react';
import { ArticleCard } from '@/components/articles/article-card';
import type { ArticleCardData } from '@/components/articles/article-card';
import apiClient from '@/lib/api-client';

interface LatestArticleListProps {
  initialArticles: ArticleCardData[];
  initialTotal: number;
}

const LIMIT = 6;

function mapArticle(a: Record<string, unknown>): ArticleCardData {
  const cat = a.category as Record<string, unknown> | null;
  const author = a.author as Record<string, unknown> | null;
  const featuredImage =
    typeof a.featured_image === 'object' && a.featured_image
      ? ((a.featured_image as Record<string, unknown>).url as string)
      : (a.featured_image as string | null) ?? null;

  return {
    slug: String(a.slug || ''),
    title: String(a.title || ''),
    excerpt: String(a.excerpt || ''),
    featuredImage,
    category: String(cat?.name || ''),
    categorySlug: String(cat?.slug || ''),
    author: {
      name: String(author?.display_name || author?.name || author?.username || 'Staff Writer'),
      avatarUrl: (author?.avatar_url ?? null) as string | null,
    },
    publishedAt: String(a.published_at || a.created_at || ''),
    readTime: Number(a.read_time_minutes || 4),
  };
}

export function LatestArticleList({ initialArticles, initialTotal }: LatestArticleListProps) {
  const [articles, setArticles] = useState<ArticleCardData[]>(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current) return; // Prevent concurrent fetches
    loadingRef.current = true;
    const nextPage = page + 1;
    try {
      setLoading(true);
      setError(null);
      const { data: responseData } = await apiClient.get('/articles', {
        params: { page: nextPage, limit: LIMIT, sort: 'date', order: 'desc' },
      });

      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapArticle);
      const totalCount = responseData.total ?? total;

      setTotal(totalCount);
      setPage(nextPage);
      setArticles((prev) => [...prev, ...fetched]);
    } catch {
      setError('Failed to load more articles. Please try again.');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, total]);

  if (articles.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {error && (
        <p className="text-center text-red-600 text-sm mt-4">{error}</p>
      )}

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${total - articles.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
