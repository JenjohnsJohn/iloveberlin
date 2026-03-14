'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CompetitionCard } from '@/components/competitions/competition-card';
import type { CompetitionCardData } from '@/components/competitions/competition-card';
import apiClient from '@/lib/api-client';

interface CompetitionCategoryContentProps {
  categorySlug: string;
  categoryName: string;
}

export function CompetitionCategoryContent({ categorySlug, categoryName }: CompetitionCategoryContentProps) {
  const [competitions, setCompetitions] = useState<CompetitionCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/competitions', {
        params: { limit: 50, category: categorySlug },
      });
      const items = responseData.data ?? responseData;
      const fetched: CompetitionCardData[] = (Array.isArray(items) ? items : []).map(
        (c: Record<string, unknown>) => {
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
        },
      );
      setCompetitions(fetched);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const visibleCompetitions = competitions.slice(0, displayCount);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            { label: categoryName },
          ]}
        />
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
            <p className="text-lg text-gray-600">
              {categoryName} competitions with amazing prizes in Berlin.
            </p>
          </div>
          <Link
            href="/competitions/archive"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View Past Competitions &rarr;
          </Link>
        </div>
      </section>

      {/* Competitions Grid */}
      <section>
        {loading && competitions.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : competitions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCompetitions.map((comp) => (
                <CompetitionCard key={comp.slug} competition={comp} />
              ))}
            </div>
            {visibleCompetitions.length < competitions.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Load More Competitions ({competitions.length - visibleCompetitions.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              No active competitions in this category right now.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Check back soon for new opportunities to win!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
