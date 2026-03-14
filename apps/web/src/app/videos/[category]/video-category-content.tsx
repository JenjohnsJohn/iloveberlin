'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { VideoCard } from '@/components/videos/video-card';
import type { VideoCardData } from '@/components/videos/video-card';
import apiClient from '@/lib/api-client';

interface VideoCategoryContentProps {
  categorySlug: string;
  categoryName: string;
}

export function VideoCategoryContent({ categorySlug, categoryName }: VideoCategoryContentProps) {
  const [videos, setVideos] = useState<VideoCardData[]>([]);
  const [series, setSeries] = useState<{ name: string; slug: string }[]>([]);
  const [activeSeriesTab, setActiveSeriesTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/videos', {
        params: { limit: 100, category: categorySlug },
      });
      const items = responseData.data ?? responseData;
      const fetched: VideoCardData[] = (Array.isArray(items) ? items : []).map(
        (v: Record<string, unknown>) => {
          const thumbnail = v.thumbnail as Record<string, unknown> | null;
          const seriesData = v.series as Record<string, unknown> | null;
          const category = v.category as Record<string, unknown> | null;
          return {
            slug: String(v.slug || ''),
            title: String(v.title || ''),
            thumbnailUrl: (thumbnail?.url || null) as string | null,
            seriesName: (seriesData?.name || null) as string | null,
            seriesSlug: (seriesData?.slug || null) as string | null,
            categoryName: (category?.name || null) as string | null,
            categorySlug: (category?.slug || null) as string | null,
            durationSeconds: (v.duration_seconds ?? null) as number | null,
            publishedAt: (v.published_at ?? null) as string | null,
            videoProvider: String(v.video_provider || ''),
          };
        },
      );
      setVideos(fetched);

      // Extract unique series from fetched videos
      const seriesMap = new Map<string, string>();
      fetched.forEach((v) => {
        if (v.seriesSlug && v.seriesName) {
          seriesMap.set(v.seriesSlug, v.seriesName);
        }
      });
      setSeries(Array.from(seriesMap.entries()).map(([slug, name]) => ({ slug, name })));
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const filteredVideos = activeSeriesTab === 'all'
    ? videos
    : videos.filter((v) => v.seriesSlug === activeSeriesTab);

  const visibleVideos = filteredVideos.slice(0, displayCount);

  useEffect(() => {
    setDisplayCount(20);
  }, [activeSeriesTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Videos', href: '/videos' },
            { label: categoryName },
          ]}
        />
      </div>

      <section className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <p className="text-lg text-gray-600">
          Watch {categoryName.toLowerCase()} videos from Berlin.
        </p>
      </section>

      {/* Series Filter */}
      {series.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveSeriesTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeSeriesTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {series.map((s) => (
              <button
                key={s.slug}
                onClick={() => setActiveSeriesTab(s.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSeriesTab === s.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Video Grid */}
      <section>
        {loading && videos.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
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
            <p className="text-gray-500 text-lg">
              No videos found in this category.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
