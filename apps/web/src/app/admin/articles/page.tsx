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
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm hover:shadow-md transition-all text-sm font-semibold"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search articles..."
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-64 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
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
          className="px-2.5 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      Title
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      Category
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      Author
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => (
                    <tr
                      key={article.id}
                      className={`border-b border-gray-100 hover:bg-primary-50/50 transition-colors ${
                        index % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {article.title}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{article.category}</td>
                      <td className="px-4 py-2.5">
                        <select
                          value={article.status}
                          onChange={(e) =>
                            handleStatusChange(article.id, e.target.value as ArticleStatus)
                          }
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_STYLES[article.status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{article.author}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                        {article.date}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/articles/${article.slug}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                            title="Edit article"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                            </svg>
                            Edit
                          </Link>
                          <Link
                            href={buildArticleUrl(article.slug, article.categorySlug)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            target="_blank"
                            title="View article"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            View
                          </Link>
                          <button
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                            onClick={() => handleDelete(article.id)}
                            title="Delete article"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
                        </svg>
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
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page <span className="font-medium text-gray-700">{page}</span> of <span className="font-medium text-gray-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
