'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { buildArticleUrl } from '@/lib/news-seo-utils';

type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

interface Article {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  status: ArticleStatus;
  author: string;
  date: string;
  slug: string;
}

const STATUS_STYLES: Record<ArticleStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  in_review: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  published: 'Published',
  archived: 'Archived',
};

function mapArticle(raw: Record<string, unknown>): Article {
  const category = raw.category as Record<string, unknown> | null;
  const author = raw.author as Record<string, unknown> | null;
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    category: String(category?.name || raw.category_name || (typeof raw.category === 'string' ? raw.category : '') || ''),
    categorySlug: String(category?.slug || raw.category_slug || ''),
    status: (raw.status as ArticleStatus) || 'draft',
    author: String(author?.display_name || author?.name || author?.username || raw.author_name || (typeof raw.author === 'string' ? raw.author : '') || ''),
    date: String(raw.published_at || raw.publishedAt || raw.created_at || raw.createdAt || raw.date || ''),
    slug: String(raw.slug || ''),
  };
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [search, setSearch] = useState('');
  const limit = 20;

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get('/categories');
        const items = Array.isArray(data) ? data : data.data ?? data.items ?? [];
        setCategories(
          items
            .filter((c: Record<string, unknown>) => !c.type || c.type === 'article')
            .map((c: Record<string, unknown>) => ({
              id: String(c.id ?? ''),
              name: String(c.name ?? ''),
              slug: String(c.slug ?? ''),
            }))
        );
      } catch {
        // Non-critical
      }
    };
    fetchCategories();
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, unknown> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;
      const { data } = await apiClient.get('/articles/admin/list', { params });
      // Handle both { data: [...], total, page } wrapper and plain array
      if (Array.isArray(data)) {
        setArticles(data.map((a: Record<string, unknown>) => mapArticle(a)));
        setTotalPages(1);
      } else {
        const raw = data.data ?? data.articles ?? [];
        setArticles(raw.map((a: Record<string, unknown>) => mapArticle(a)));
        const total = data.total ?? data.totalCount ?? 0;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load articles';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      setError(null);
      await apiClient.delete(`/articles/${id}`);
      await fetchArticles();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete article';
      setError(message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ArticleStatus) => {
    try {
      setError(null);
      await apiClient.patch(`/articles/${id}/status`, { status: newStatus });
      await fetchArticles();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update article status';
      setError(message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Articles</h2>
        <Link
          href="/admin/articles/new"
          className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search articles..."
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
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-6 w-6 text-primary-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500">Loading articles...</span>
        </div>
      ) : (
        <>
          {/* Articles Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                      Author
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {article.title}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{article.category}</td>
                      <td className="px-3 py-2">
                        <select
                          value={article.status}
                          onChange={(e) =>
                            handleStatusChange(article.id, e.target.value as ArticleStatus)
                          }
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[article.status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{article.author}</td>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                        {article.date}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.slug}/edit`}
                            className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            href={buildArticleUrl(article.slug, article.categorySlug)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            target="_blank"
                          >
                            View
                          </Link>
                          <button
                            className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            onClick={() => handleDelete(article.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No articles found.
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
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
