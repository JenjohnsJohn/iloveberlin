'use client';

import { useState, useCallback } from 'react';
import { VideoCard } from '@/components/videos/video-card';
import type { VideoCardData } from '@/components/videos/video-card';
import apiClient from '@/lib/api-client';

interface LatestVideoListProps {
  initialVideos: VideoCardData[];
  initialTotal: number;
}

const LIMIT = 6;

function mapVideo(v: Record<string, unknown>): VideoCardData {
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
}

export function LatestVideoList({ initialVideos, initialTotal }: LatestVideoListProps) {
  const [videos, setVideos] = useState<VideoCardData[]>(initialVideos);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/videos', {
        params: { page: nextPage, limit: LIMIT, sort: 'date', order: 'desc' },
      });
      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapVideo);
      setTotal(responseData.total ?? total);
      setPage(nextPage);
      setVideos((prev) => [...prev, ...fetched]);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [page, total]);

  if (videos.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Videos</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${total - videos.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
