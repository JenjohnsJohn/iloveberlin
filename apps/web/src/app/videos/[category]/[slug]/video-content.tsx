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

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const shareLinks = [
    {
      name: 'X',
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this video: ${url}`)}`,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target={link.name === 'Email' ? undefined : '_blank'}
          rel="noopener noreferrer"
          aria-label={`Share on ${link.name}`}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
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
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-1 shadow-lg ring-1 ring-black/5">
            <iframe
              src={video.embedUrl}
              title={video.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Now Playing indicator */}
          <div className="flex items-center gap-2 mb-5 px-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              Now Playing
            </span>
          </div>

          {/* Video Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {video.seriesName && video.seriesSlug && (
                <Link
                  href={`/videos/series/${video.seriesSlug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full hover:bg-primary-200 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  {video.seriesName}
                </Link>
              )}
              {video.categoryName && (
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {video.categoryName}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {video.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {video.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {formatDate(video.publishedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Description</h2>
              <div className="prose prose-gray prose-sm max-w-none">
                {video.description.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              </svg>
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Section */}
          <div className="border-t border-gray-200 pt-5 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Share this video</span>
              <ShareButtons title={video.title} slug={video.slug} />
            </div>
          </div>
        </div>

        {/* Sidebar - Related Videos */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-primary-500">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">
                Up Next
              </h2>
            </div>
            <div className="space-y-3">
              {relatedVideos.length > 0 ? (
                relatedVideos.map((relatedVideo) => (
                  <VideoCard key={relatedVideo.slug} video={relatedVideo} />
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-sm text-gray-400">No related videos found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
