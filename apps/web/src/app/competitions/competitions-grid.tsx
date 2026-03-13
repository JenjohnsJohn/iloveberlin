'use client';

import { useState } from 'react';
import { CompetitionCard } from '@/components/competitions/competition-card';
import type { CompetitionCardData } from '@/components/competitions/competition-card';

const ITEMS_PER_PAGE = 20;

export function CompetitionsGrid({ competitions }: { competitions: CompetitionCardData[] }) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const visibleCompetitions = competitions.slice(0, displayCount);

  if (competitions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="img"
            aria-label="No competitions"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">
          No active competitions right now.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Check back soon for new opportunities to win!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCompetitions.map((comp) => (
          <CompetitionCard key={comp.slug} competition={comp} />
        ))}
      </div>
      {visibleCompetitions.length < competitions.length && (
        <div className="text-center mt-10">
          <button
            onClick={() => setDisplayCount((prev) => prev + ITEMS_PER_PAGE)}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Load More Competitions ({competitions.length - visibleCompetitions.length} remaining)
          </button>
        </div>
      )}
    </>
  );
}
