import Link from 'next/link';
import { buildVideoUrl } from '@/lib/videos-seo-utils';
import { formatDate } from '@/lib/format-date';

export interface VideoCardData {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  seriesName: string | null;
  seriesSlug: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
  videoProvider: string;
}

interface VideoCardProps {
  video: VideoCardData;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}


export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      href={buildVideoUrl(video.slug, video.categorySlug)}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Thumbnail with play icon and duration */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <svg
              className="w-12 h-12 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Bottom gradient overlay for duration readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30 group-hover:ring-primary-400/50 group-hover:bg-primary-600/80 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-black/20">
            <svg className="w-6 h-6 text-white ml-1 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration overlay */}
        {video.durationSeconds && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-md font-mono tracking-wide">
            {formatDuration(video.durationSeconds)}
          </span>
        )}

        {/* Series badge */}
        {video.seriesName && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-violet-600 text-white text-xs font-semibold rounded-full shadow-sm">
            {video.seriesName}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
          {video.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {video.seriesName && (
            <span className="font-medium text-gray-600">{video.seriesName}</span>
          )}
          {video.publishedAt && (
            <span>{formatDate(video.publishedAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
