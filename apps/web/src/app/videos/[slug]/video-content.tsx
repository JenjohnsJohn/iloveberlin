'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VideoCard } from '@/components/videos/video-card';
import type { VideoCardData } from '@/components/videos/video-card';
import apiClient from '@/lib/api-client';

interface VideoContentProps {
  video: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    embedUrl: string;
    thumbnailUrl: string | null;
    seriesName: string | null;
    seriesSlug: string | null;
    categoryName: string | null;
    durationSeconds: number | null;
    publishedAt: string | null;
    tags: string[];
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function VideoContent({ video }: VideoContentProps) {
  const [relatedVideos, setRelatedVideos] = useState<VideoCardData[]>([]);

  useEffect(() => {
    if (!video.id) return;
    apiClient.get(`/videos/${video.id}/related`).then(({ data }) => {
      const items = Array.isArray(data) ? data : data.data ?? [];
      setRelatedVideos(
        items.map((v: Record<string, unknown>) => {
          const thumb = v.thumbnail as Record<string, unknown> | null;
          const series = v.series as Record<string, unknown> | null;
          return {
            slug: String(v.slug || ''),
            title: String(v.title || ''),
            thumbnailUrl: (thumb?.url || null) as string | null,
            seriesName: (series?.name || null) as string | null,
            seriesSlug: (series?.slug || null) as string | null,
            durationSeconds: (v.duration_seconds ?? null) as number | null,
            publishedAt: (v.published_at || null) as string | null,
            videoProvider: String(v.video_provider || 'youtube'),
          };
        }),
      );
    }).catch(() => {});
  }, [video.id]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/videos" className="hover:text-primary-600">
          Videos
        </Link>
        {video.seriesName && video.seriesSlug && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/videos/series/${video.seriesSlug}`}
              className="hover:text-primary-600"
            >
              {video.seriesName}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{video.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Video Embed */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6">
            <iframe
              src={video.embedUrl}
              title={video.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Info */}
          <div className="mb-6">
            {video.seriesName && video.seriesSlug && (
              <Link
                href={`/videos/series/${video.seriesSlug}`}
                className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-3 hover:bg-primary-200 transition-colors"
              >
                {video.seriesName}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {video.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {video.publishedAt && (
                <span>{formatDate(video.publishedAt)}</span>
              )}
              {video.categoryName && (
                <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                  {video.categoryName}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="prose prose-gray max-w-none mb-6">
              {video.description.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-700 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <span className="text-sm font-medium text-gray-500">Tags:</span>
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Related Videos */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Related Videos
          </h2>
          <div className="space-y-4">
            {relatedVideos.length > 0 ? (
              relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.slug} video={relatedVideo} />
              ))
            ) : (
              <p className="text-sm text-gray-400">No related videos found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
