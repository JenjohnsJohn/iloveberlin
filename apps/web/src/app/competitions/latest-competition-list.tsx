'use client';

import { useState, useCallback } from 'react';
import { CompetitionCard } from '@/components/competitions/competition-card';
import type { CompetitionCardData } from '@/components/competitions/competition-card';
import apiClient from '@/lib/api-client';

interface LatestCompetitionListProps {
  initialCompetitions: CompetitionCardData[];
  initialTotal: number;
}

const LIMIT = 6;

function mapCompetition(c: Record<string, unknown>): CompetitionCardData {
  const featuredImage = c.featured_image as Record<string, unknown> | null;
  const winner = c.winner as Record<string, unknown> | null;
  return {
    slug: String(c.slug || ''),
    title: String(c.title || ''),
    description: String(c.description || ''),
    prizeDescription: (c.prize_description || null) as string | null,
    featuredImage: (featuredImage?.url || null) as string | null,
    endDate: String(c.end_date || ''),
    entryCount: Number(c.entry_count || 0),
    status: String(c.status || ''),
    winnerName: (winner?.display_name || null) as string | null,
    categorySlug: ((c.category as Record<string, unknown> | null)?.slug || null) as string | null,
  };
}

export function LatestCompetitionList({ initialCompetitions, initialTotal }: LatestCompetitionListProps) {
  const [competitions, setCompetitions] = useState<CompetitionCardData[]>(initialCompetitions);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/competitions', {
        params: { page: nextPage, limit: LIMIT, sort: 'date', order: 'desc' },
      });
      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapCompetition);
      setTotal(responseData.total ?? total);
      setPage(nextPage);
      setCompetitions((prev) => [...prev, ...fetched]);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [page, total]);

  if (competitions.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Competitions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((competition) => (
          <CompetitionCard key={competition.slug} competition={competition} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${total - competitions.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
