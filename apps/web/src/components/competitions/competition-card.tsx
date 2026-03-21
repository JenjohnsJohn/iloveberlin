'use client';

import Link from 'next/link';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { buildCompetitionUrl } from '@/lib/competitions-seo-utils';

export interface CompetitionCardData {
  slug: string;
  title: string;
  description: string;
  prizeDescription: string | null;
  featuredImage: string | null;
  endDate: string;
  entryCount: number;
  status: string;
  winnerName?: string | null;
  categorySlug?: string | null;
}

interface CompetitionCardProps {
  competition: CompetitionCardData;
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const isEnded =
    new Date(competition.endDate).getTime() < Date.now() ||
    competition.status === 'closed' ||
    competition.status === 'archived';

  return (
    <Link
      href={buildCompetitionUrl(competition.slug, competition.categorySlug)}
      className={`group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ${
        !isEnded
          ? 'hover:shadow-[0_4px_20px_-2px_rgba(245,158,11,0.25)]'
          : 'hover:shadow-primary-glow'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {competition.featuredImage ? (
          <img
            src={competition.featuredImage}
            alt={competition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
            <svg
              className="w-14 h-14 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
        )}
        {/* Status badge */}
        {isEnded && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-gray-700 text-white text-xs font-semibold rounded-full">
            Ended
          </span>
        )}
        {!isEnded && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
            Active
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {competition.title}
        </h3>

        {/* Prize */}
        {competition.prizeDescription && (
          <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium mb-3">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.985 6.985 0 01-4.27 1.472 6.985 6.985 0 01-4.27-1.472"
              />
            </svg>
            <span className="line-clamp-1">{competition.prizeDescription}</span>
          </div>
        )}

        {/* Countdown or Winner */}
        {isEnded ? (
          competition.winnerName ? (
            <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium mb-3">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Winner: {competition.winnerName}</span>
            </div>
          ) : (
            <div className="text-sm text-red-600 font-semibold mb-3">
              Competition Ended
            </div>
          )
        ) : (
          <div className="mb-3">
            <CountdownTimer endDate={competition.endDate} />
          </div>
        )}

        {/* Entry count & CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {competition.entryCount}{' '}
            {competition.entryCount === 1 ? 'entry' : 'entries'}
          </span>
          {!isEnded && (
            <span className="inline-flex items-center gap-1 px-4 py-1.5 btn-gradient text-xs font-semibold rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              Enter Now
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
