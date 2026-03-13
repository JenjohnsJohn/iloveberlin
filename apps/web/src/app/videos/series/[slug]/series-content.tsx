'use client';

import Link from 'next/link';
import { VideoCard } from '@/components/videos/video-card';
import type { VideoCardData } from '@/components/videos/video-card';

interface SeriesContentProps {
  series: {
    name: string;
    slug: string;
    description: string | null;
  };
  videos: VideoCardData[];
}

export function SeriesContent({ series, videos }: SeriesContentProps) {
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
        <span className="mx-2">/</span>
        <span className="text-gray-700">{series.name}</span>
      </nav>

      {/* Series Header */}
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {series.name}
        </h1>
        {series.description && (
          <p className="text-lg text-gray-600 max-w-3xl">
            {series.description}
          </p>
        )}
        <div className="mt-4 text-sm text-gray-500">
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </div>
      </section>

      {/* Videos Grid */}
      <section>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.slug} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="No videos"
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
              No videos in this series yet.
            </p>
            <Link
              href="/videos"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Browse all videos
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
