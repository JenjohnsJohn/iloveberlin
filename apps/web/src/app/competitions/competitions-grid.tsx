'use client';

import { useState, useMemo } from 'react';
import { CompetitionCard } from '@/components/competitions/competition-card';
import type { CompetitionCardData } from '@/components/competitions/competition-card';

const ITEMS_PER_PAGE = 20;

interface CompetitionsGridProps {
  competitions: (CompetitionCardData & { categorySlug?: string | null })[];
  categories?: { name: string; slug: string }[];
}

export function CompetitionsGrid({ competitions, categories = [] }: CompetitionsGridProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [activeCategorySlug, setActiveCategorySlug] = useState('');

  const filteredCompetitions = useMemo(() => {
    if (!activeCategorySlug) return competitions;
    return competitions.filter((c) => c.categorySlug === activeCategorySlug);
  }, [competitions, activeCategorySlug]);

  const visibleCompetitions = filteredCompetitions.slice(0, displayCount);

  return (
    <>
      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setActiveCategorySlug('')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !activeCategorySlug
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategorySlug(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategorySlug === cat.slug
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filteredCompetitions.length === 0 ? (
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
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCompetitions.map((comp) => (
              <CompetitionCard key={comp.slug} competition={comp} />
            ))}
          </div>
          {visibleCompetitions.length < filteredCompetitions.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setDisplayCount((prev) => prev + ITEMS_PER_PAGE)}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Load More Competitions ({filteredCompetitions.length - visibleCompetitions.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
