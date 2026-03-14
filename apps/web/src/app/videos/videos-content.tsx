'use client';

import { useState, useEffect, useMemo } from 'react';
import { VideoCard } from '@/components/videos/video-card';
import type { VideoCardData } from '@/components/videos/video-card';
interface CategoryNode {
  name: string;
  slug: string;
  children?: CategoryNode[];
}

interface VideosContentProps {
  videos: VideoCardData[];
  series: { name: string; slug: string }[];
  categories?: CategoryNode[];
}

export function VideosContent({ videos, series, categories = [] }: VideosContentProps) {
  const [activeSeriesTab, setActiveSeriesTab] = useState('all');
  const [activeRootSlug, setActiveRootSlug] = useState('');
  const [activeSubcategorySlug, setActiveSubcategorySlug] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  const seriesTabs = [
    { name: 'All', slug: 'all' },
    ...series,
  ];

  // Find active root and its subcategories
  const activeRoot = categories.find((c) => c.slug === activeRootSlug);
  const subcategories = activeRoot?.children || [];

  // Build set of matching category slugs for current filter
  const matchingSlugs = useMemo(() => {
    if (!activeRootSlug) return null; // null means "all"
    const slugs = new Set<string>();
    if (activeSubcategorySlug) {
      slugs.add(activeSubcategorySlug);
    } else {
      // Root selected: match root + all children
      slugs.add(activeRootSlug);
      subcategories.forEach((sub) => slugs.add(sub.slug));
    }
    return slugs;
  }, [activeRootSlug, activeSubcategorySlug, subcategories]);

  const filteredVideos = videos.filter((v) => {
    if (activeSeriesTab !== 'all' && v.seriesSlug !== activeSeriesTab) return false;
    if (matchingSlugs && v.categorySlug && !matchingSlugs.has(v.categorySlug)) return false;
    if (matchingSlugs && !v.categorySlug) return false;
    return true;
  });

  const visibleVideos = filteredVideos.slice(0, displayCount);

  // Reset displayCount when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [activeSeriesTab, activeRootSlug, activeSubcategorySlug]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Berlin Videos
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch our video series exploring Berlin life, food, culture, and the people
          who make this city unique.
        </p>
      </section>

      {/* Series Tabs */}
      <section className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter by series">
          {seriesTabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveSeriesTab(tab.slug)}
              role="tab"
              aria-selected={activeSeriesTab === tab.slug}
              aria-label={`Filter by ${tab.name}`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeSeriesTab === tab.slug
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </section>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <section className="mb-8">
          {/* Root category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter by category">
            <button
              onClick={() => { setActiveRootSlug(''); setActiveSubcategorySlug(''); }}
              role="tab"
              aria-selected={!activeRootSlug}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                !activeRootSlug
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => { setActiveRootSlug(cat.slug); setActiveSubcategorySlug(''); }}
                role="tab"
                aria-selected={activeRootSlug === cat.slug}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  activeRootSlug === cat.slug
                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Subcategory pills */}
          {subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-2">
              <button
                onClick={() => setActiveSubcategorySlug('')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  !activeSubcategorySlug
                    ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                All {activeRoot?.name}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() => setActiveSubcategorySlug(sub.slug)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSubcategorySlug === sub.slug
                      ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Video Grid */}
      <section>
        {filteredVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleVideos.map((video) => (
                <VideoCard key={video.slug} video={video} />
              ))}
            </div>
            {visibleVideos.length < filteredVideos.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Load More Videos ({filteredVideos.length - visibleVideos.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="No videos found"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              No videos found matching your filters.
            </p>
            <button
              onClick={() => { setActiveSeriesTab('all'); setActiveRootSlug(''); setActiveSubcategorySlug(''); }}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
