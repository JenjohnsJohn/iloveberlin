'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleCard } from '@/components/articles/article-card';
import { CategoryFilter } from '@/components/articles/category-filter';
import type { CategoryItem } from '@/components/articles/category-filter';
import type { ArticleCardData } from '@/components/articles/article-card';
import apiClient from '@/lib/api-client';

const ALL_CATEGORY: CategoryItem = { name: 'All', slug: '' };

export default function NewsPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([ALL_CATEGORY]);
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  // Fetch categories from API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get('/categories');
        const items = Array.isArray(data) ? data : data.data ?? data.items ?? [];
        const articleCategories: CategoryItem[] = items
          .filter((c: Record<string, unknown>) => {
            const type = c.type as string | undefined;
            return !type || type === 'article';
          })
          .map((c: Record<string, unknown>) => ({
            name: String(c.name || ''),
            slug: String(c.slug || ''),
          }));
        setCategories([ALL_CATEGORY, ...articleCategories]);
      } catch {
        // Keep default "All" if API fails
      }
    };
    fetchCategories();
  }, []);

  const fetchArticles = useCallback(async (pageNum: number, categorySlug: string, search: string, append: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        page: pageNum,
        limit,
      };

      if (categorySlug) {
        params.category = categorySlug;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const { data: responseData } = await apiClient.get('/articles', { params });

      const fetchedArticles: ArticleCardData[] = (responseData.data ?? responseData).map(
        (a: Record<string, unknown>) => ({
          slug: a.slug as string,
          title: a.title as string,
          excerpt: (a.excerpt || a.summary || '') as string,
          featuredImage: (a.featured_image || a.featuredImage || null) as string | null,
          category: ((a.category as Record<string, unknown>)?.name || a.category || '') as string,
          categorySlug: ((a.category as Record<string, unknown>)?.slug || a.categorySlug || '') as string,
          author: {
            name: ((a.author as Record<string, unknown>)?.display_name ||
              (a.author as Record<string, unknown>)?.name ||
              (a.author as Record<string, unknown>)?.username ||
              'Staff Writer') as string,
            avatarUrl: ((a.author as Record<string, unknown>)?.avatar_url ||
              (a.author as Record<string, unknown>)?.avatarUrl ||
              null) as string | null,
          },
          publishedAt: (a.published_at || a.publishedAt || a.created_at || a.createdAt || '') as string,
          readTime: (a.read_time_minutes || a.read_time || a.readTime || 4) as number,
        }),
      );

      const totalCount = responseData.total ?? 0;
      setTotal(totalCount);
      setHasMore(pageNum * limit < totalCount);

      if (append) {
        setArticles((prev) => [...prev, ...fetchedArticles]);
      } else {
        setArticles(fetchedArticles);
      }
    } catch {
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when category/search changes
  useEffect(() => {
    setPage(1);
    fetchArticles(1, activeCategorySlug, searchQuery, false);
  }, [activeCategorySlug, searchQuery, fetchArticles]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage, activeCategorySlug, searchQuery, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Berlin News
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed with the latest stories, events, and happenings from
          Germany&apos;s vibrant capital.
        </p>
      </section>

      {/* Search */}
      <section className="mb-6">
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearchQuery(''); }}
              className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      {/* Category Filter */}
      <section className="mb-8">
        <CategoryFilter
          categories={categories}
          activeSlug={activeCategorySlug}
          onCategoryChange={(slug) => { setActiveCategorySlug(slug); }}
        />
      </section>

      {/* Article Grid */}
      <section>
        {error && !loading && articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">{error}</p>
          </div>
        ) : loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
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
              No articles found{activeCategorySlug ? ' in this category' : ''}.
            </p>
          </div>
        )}
      </section>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More Articles (${total - articles.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
