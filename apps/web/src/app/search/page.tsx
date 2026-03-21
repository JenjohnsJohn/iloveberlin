'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api-client';

const CONTENT_TYPES = [
  { key: 'All', label: 'All', icon: null },
  { key: 'Articles', label: 'News', icon: 'newspaper' },
  { key: 'Events', label: 'Events', icon: 'calendar' },
  { key: 'Restaurants', label: 'Dining', icon: 'dining' },
  { key: 'Guides', label: 'Guide', icon: 'guide' },
  { key: 'Videos', label: 'Videos', icon: 'video' },
  { key: 'Classifieds', label: 'Classifieds', icon: 'tag' },
  { key: 'Products', label: 'Store', icon: 'store' },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]['key'];

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
    articles: 'bg-blue-100 text-blue-800 border border-blue-200',
    events: 'bg-purple-100 text-purple-800 border border-purple-200',
    restaurants: 'bg-orange-100 text-orange-800 border border-orange-200',
    guides: 'bg-green-100 text-green-800 border border-green-200',
    videos: 'bg-red-100 text-red-800 border border-red-200',
    classifieds: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    products: 'bg-pink-100 text-pink-800 border border-pink-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
}

function getTypePlaceholderColor(type: string): string {
  const colors: Record<string, string> = {
    articles: 'from-blue-100 to-blue-50',
    events: 'from-purple-100 to-purple-50',
    restaurants: 'from-orange-100 to-orange-50',
    guides: 'from-green-100 to-green-50',
    videos: 'from-red-100 to-red-50',
    classifieds: 'from-yellow-100 to-yellow-50',
    products: 'from-pink-100 to-pink-50',
  };
  return colors[type] || 'from-gray-100 to-gray-50';
}

/** Inline type icon for result cards */
function ResultTypeIcon({ type, className = 'w-4 h-4' }: { type: string; className?: string }) {
  switch (type) {
    case 'articles':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    case 'events':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'restaurants':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6M3 7a4 4 0 014-4h10a4 4 0 014 4v.5M7 3v4m10-4v4M5 14h14M8 21h8" />
        </svg>
      );
    case 'guides':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case 'videos':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'classifieds':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
    case 'products':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
  }
}

/** Filter pill icon (smaller, used in filter buttons) */
function FilterIcon({ icon }: { icon: string | null }) {
  if (!icon) return null;
  const cls = 'w-3.5 h-3.5 flex-shrink-0';
  switch (icon) {
    case 'newspaper':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
      );
    case 'calendar':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      );
    case 'dining':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6M3 7a4 4 0 014-4h10a4 4 0 014 4v.5M7 3v4m10-4v4M5 14h14M8 21h8" /></svg>
      );
    case 'guide':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
      );
    case 'video':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      );
    case 'tag':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
      );
    case 'store':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      );
    default:
      return null;
  }
}

/** Highlight matched terms in text by bolding them */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  // Split query into words and escape for regex
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (words.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark key={i} className="bg-primary-100 text-primary-900 rounded-sm px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ResultCard({ result, query }: { result: SearchResult; query: string }) {
  const detailHref = `${getTypeSlug(result.type)}/${result.slug}`;

  return (
    <Link
      href={detailHref}
      className="group block bg-white border border-gray-200 rounded-xl p-0 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="flex">
        {/* Thumbnail */}
        <div className="hidden sm:block w-40 md:w-48 flex-shrink-0 relative">
          {result.imageUrl ? (
            <Image
              src={result.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 160px, 192px"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getTypePlaceholderColor(result.type)} flex items-center justify-center min-h-[8rem]`}>
              <ResultTypeIcon type={result.type} className="w-10 h-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getTypeColor(result.type)}`}>
              <ResultTypeIcon type={result.type} className="w-3 h-3" />
              {getTypeLabel(result.type)}
            </span>
            {result.category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{result.category}</span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-primary-700 transition-colors">
            <HighlightText text={result.title} query={query} />
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            <HighlightText text={result.description} query={query} />
          </p>

          {/* Type-specific metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {result.type === 'articles' && (
              <>
                {result.author && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {result.author}
                  </span>
                )}
                {result.date && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {result.date}
                  </span>
                )}
                {result.readTime && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    {result.readTime} min read
                  </span>
                )}
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
                {result.cuisine && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    {result.cuisine}
                  </span>
                )}
                {result.rating && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {result.rating}
                  </span>
                )}
                {result.price && (
                  <span className="font-medium text-gray-700">{result.price}</span>
                )}
              </>
            )}
            {result.type === 'guides' && (
              <>
                {result.author && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {result.author}
                  </span>
                )}
                {result.readTime && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    {result.readTime} min read
                  </span>
                )}
              </>
            )}
            {result.type === 'videos' && (
              <>
                {result.date && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {result.date}
                  </span>
                )}
              </>
            )}
            {(result.type === 'classifieds' || result.type === 'products') && (
              <>
                {result.price && (
                  <span className="font-semibold text-gray-900 text-sm">{result.price}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Hover arrow */}
        <div className="hidden md:flex items-center pr-4 text-gray-300 group-hover:text-primary-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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

  // Generate visible page numbers with ellipsis logic
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [1];
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
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

      {/* Type Filter Pills */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeType === key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {icon && (
                <span className={activeType === key ? 'text-white/80' : 'text-gray-400'}>
                  <FilterIcon icon={icon} />
                </span>
              )}
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Error State */}
      {searchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {searchError}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <section className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex animate-pulse">
              <div className="hidden sm:block w-40 md:w-48 bg-gray-100 flex-shrink-0" />
              <div className="flex-1 p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
                <div className="flex gap-3">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
            </div>
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
                  {activeType !== 'All' && (
                    <span> in <span className="font-medium text-gray-700">{CONTENT_TYPES.find(t => t.key === activeType)?.label}</span></span>
                  )}
                </p>
                <div className="space-y-4">
                  {results.map((result) => (
                    <ResultCard key={`${result.type}-${result.id}`} result={result} query={query} />
                  ))}
                </div>
              </>
            ) : (
              /* Enhanced empty state */
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
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
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {query ? 'No results found' : 'Start searching'}
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                  {query
                    ? `We couldn't find anything matching "${query}". Try adjusting your search or explore our suggestions below.`
                    : 'Enter a search term to find articles, events, restaurants, and more across Berlin.'}
                </p>

                {query && (
                  <div className="max-w-sm mx-auto mb-8 text-left bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Search tips</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Try broader or different keywords
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Check your spelling
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Use fewer, more general words
                      </li>
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-sm text-gray-400 mr-1">Popular searches:</span>
                  {['Berlin events', 'restaurants', 'street food', 'museums', 'nightlife', 'weekend guide'].map(
                    (suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="text-sm text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-full transition-colors font-medium"
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
            <nav className="flex justify-center items-center gap-1.5 mt-12" aria-label="Search results pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors"
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePages().map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                      className={`min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        p === page
                          ? 'text-white bg-primary-600 shadow-md shadow-primary-200'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors"
                aria-label="Next page"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
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
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-24" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex">
                  <div className="hidden sm:block w-40 md:w-48 bg-gray-100 flex-shrink-0" style={{ minHeight: '8rem' }} />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
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
