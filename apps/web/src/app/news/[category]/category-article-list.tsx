'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ArticleCard } from '@/components/articles/article-card';
import type { ArticleCardData } from '@/components/articles/article-card';
import apiClient from '@/lib/api-client';

interface CategoryArticleListProps {
  categorySlug: string;
  categoryName: string;
}

export function CategoryArticleList({ categorySlug, categoryName }: CategoryArticleListProps) {
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 12;

  const fetchArticles = useCallback(async (pageNum: number, append: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const { data: responseData } = await apiClient.get('/articles', {
        params: { category: categorySlug, page: pageNum, limit },
      });

      const items = responseData.data ?? responseData;
      const fetched: ArticleCardData[] = (Array.isArray(items) ? items : []).map(
        (a: Record<string, unknown>) => {
          const cat = a.category as Record<string, unknown> | null;
          const author = a.author as Record<string, unknown> | null;
          const featuredImage = typeof a.featured_image === 'object' && a.featured_image
            ? (a.featured_image as Record<string, unknown>).url as string
            : (a.featured_image as string | null) ?? null;

          return {
            slug: String(a.slug || ''),
            title: String(a.title || ''),
            excerpt: String(a.excerpt || ''),
            featuredImage,
            category: String(cat?.name || categoryName),
            categorySlug: String(cat?.slug || categorySlug),
            author: {
              name: String(author?.display_name || author?.name || author?.username || 'Staff Writer'),
              avatarUrl: (author?.avatar_url ?? null) as string | null,
            },
            publishedAt: String(a.published_at || a.created_at || ''),
            readTime: Number(a.read_time_minutes || 4),
          };
        }
      );

      const totalCount = responseData.total ?? 0;
      setTotal(totalCount);
      setHasMore(pageNum * limit < totalCount);

      if (append) {
        setArticles((prev) => [...prev, ...fetched]);
      } else {
        setArticles(fetched);
      }
    } catch {
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categorySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
    fetchArticles(1, false);
  }, [fetchArticles]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage, true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'News', href: '/news' },
            { label: categoryName },
          ]}
        />
      </div>

      {/* Category Heading */}
      <section className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {categoryName}
        </h1>
        <p className="text-lg text-gray-600">
          The latest {categoryName.toLowerCase()} news and stories from Berlin.
        </p>
      </section>

      {/* Article Grid */}
      <section>
        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No articles found in this category yet.
            </p>
          </div>
        )}
      </section>

      {error && (
        <p className="text-center text-red-600 text-sm mt-4">{error}</p>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${total - articles.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
