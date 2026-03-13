'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

const CONTENT_TYPES = [
  'All',
  'Articles',
  'Events',
  'Restaurants',
  'Guides',
  'Videos',
  'Classifieds',
  'Products',
] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  slug: string;
  category?: string;
  date?: string;
  venue?: string;
  cuisine?: string;
  rating?: number;
  price?: string;
  author?: string;
  readTime?: number;
  imageUrl?: string | null;
}

function getTypeSlug(type: string): string {
  const typeRoutes: Record<string, string> = {
    articles: '/news',
    events: '/events',
    restaurants: '/dining',
    guides: '/guide',
    videos: '/videos',
    classifieds: '/classifieds',
    products: '/store',
  };
  return typeRoutes[type] || '/';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    articles: 'Article',
    events: 'Event',
    restaurants: 'Restaurant',
    guides: 'Guide',
    videos: 'Video',
    classifieds: 'Classified',
    products: 'Product',
  };
  return labels[type] || type;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    articles: 'bg-blue-100 text-blue-800',
    events: 'bg-purple-100 text-purple-800',
    restaurants: 'bg-orange-100 text-orange-800',
    guides: 'bg-green-100 text-green-800',
    videos: 'bg-red-100 text-red-800',
    classifieds: 'bg-yellow-100 text-yellow-800',
    products: 'bg-pink-100 text-pink-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

function ResultCard({ result }: { result: SearchResult }) {
  const detailHref = `${getTypeSlug(result.type)}/${result.slug}`;

  return (
    <Link
      href={detailHref}
      className="block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-primary-300 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail placeholder */}
        <div className="hidden sm:flex w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
              {getTypeLabel(result.type)}
            </span>
            {result.category && (
              <span className="text-xs text-gray-500">{result.category}</span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {result.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {result.description}
          </p>

          {/* Type-specific metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {result.type === 'articles' && (
              <>
                {result.author && <span>By {result.author}</span>}
                {result.date && <span>{result.date}</span>}
                {result.readTime && <span>{result.readTime} min read</span>}
              </>
            )}
            {result.type === 'events' && (
              <>
                {result.date && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {result.date}
                  </span>
                )}
                {result.venue && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {result.venue}
                  </span>
                )}
              </>
            )}
            {result.type === 'restaurants' && (
              <>
                {result.cuisine && <span>{result.cuisine}</span>}
                {result.rating && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {result.rating}
                  </span>
                )}
              </>
            )}
            {result.type === 'guides' && (
              <>
                {result.author && <span>By {result.author}</span>}
                {result.readTime && <span>{result.readTime} min read</span>}
              </>
            )}
            {result.type === 'videos' && (
              <>
                {result.date && <span>{result.date}</span>}
              </>
            )}
            {(result.type === 'classifieds' || result.type === 'products') && (
              <>
                {result.price && (
                  <span className="font-medium text-gray-900">{result.price}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeType, setActiveType] = useState<ContentType>('All');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!query) {
      setResults([]);
      setTotal(0);
      return;
    }
    setIsLoading(true);
    setSearchError(null);
    try {
      const params: Record<string, string | number> = { q: query, page };
      if (activeType !== 'All') {
        params.type = activeType.toLowerCase();
      }
      const { data } = await apiClient.get('/search', { params });
      const items: SearchResult[] = (data.data ?? data.results ?? (Array.isArray(data) ? data : []))
        .map((r: Record<string, unknown>) => ({
          id: String(r.id || ''),
          type: String(r.type || ''),
          title: String(r.title || ''),
          description: String(r.description || ''),
          slug: String(r.slug || ''),
          category: r.category ? String(r.category) : undefined,
          date: r.date ? String(r.date) : undefined,
          venue: r.venue ? String(r.venue) : undefined,
          cuisine: r.cuisine ? String(r.cuisine) : undefined,
          rating: r.rating ? Number(r.rating) : undefined,
          price: r.price ? String(r.price) : undefined,
          author: r.author ? String(r.author) : undefined,
          readTime: r.readTime || r.read_time ? Number(r.readTime || r.read_time) : undefined,
          imageUrl: r.imageUrl || r.image_url || null,
        }));
      setResults(items);
      setTotal(Number(data.total ?? items.length));
    } catch {
      setSearchError('Failed to load search results. Please try again.');
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, activeType, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [activeType, query]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-600">
            Showing results for{' '}
            <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
          </p>
        )}
      </section>

      {/* Type Filter Tabs */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Error State */}
      {searchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {searchError}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <section className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </section>
      ) : (
        <>
          {/* Results */}
          <section>
            {results.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {total} result{total !== 1 ? 's' : ''} found
                </p>
                <div className="space-y-4">
                  {results.map((result) => (
                    <ResultCard key={`${result.type}-${result.id}`} result={result} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <svg
                  className="mx-auto w-16 h-16 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {query
                    ? `We couldn't find anything matching "${query}". Try different keywords or browse our content.`
                    : 'Enter a search term to find articles, events, restaurants, and more.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-sm text-gray-500">Try searching for:</span>
                  {['Berlin events', 'restaurants', 'street food', 'museums'].map(
                    (suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        {suggestion}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Pagination */}
          {results.length > 0 && totalPages > 1 && (
            <section className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      p === page
                        ? 'text-white bg-primary-600'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-64 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-96 mb-8" />
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-24" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
