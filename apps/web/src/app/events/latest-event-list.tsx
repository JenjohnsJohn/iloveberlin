'use client';

import { useState, useCallback } from 'react';
import { EventCard } from '@/components/events/event-card';
import type { EventCardData } from '@/components/events/event-card';
import apiClient from '@/lib/api-client';

interface LatestEventListProps {
  initialEvents: EventCardData[];
  initialTotal: number;
}

const LIMIT = 6;

function mapEvent(e: Record<string, unknown>): EventCardData {
  return {
    slug: e.slug as string,
    title: e.title as string,
    excerpt: (e.excerpt || e.description || e.summary || '') as string,
    featuredImage: (e.featured_image || e.featuredImage || null) as string | null,
    category: ((e.category as Record<string, unknown>)?.name || e.category || '') as string,
    categorySlug: ((e.category as Record<string, unknown>)?.slug || e.categorySlug || '') as string,
    venueName: ((e.venue as Record<string, unknown>)?.name || e.venue_name || e.venueName || null) as string | null,
    startDate: (e.start_date || e.startDate || '') as string,
    startTime: (e.start_time || e.startTime || null) as string | null,
    endTime: (e.end_time || e.endTime || null) as string | null,
    isFree: (e.is_free ?? e.isFree ?? false) as boolean,
    price: (e.price ?? null) as number | null,
    priceMax: (e.price_max ?? e.priceMax ?? null) as number | null,
  };
}

export function LatestEventList({ initialEvents, initialTotal }: LatestEventListProps) {
  const [events, setEvents] = useState<EventCardData[]>(initialEvents);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = page * LIMIT < total;

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoading(true);
      const { data: responseData } = await apiClient.get('/events', {
        params: { page: nextPage, limit: LIMIT, sort: 'date', order: 'desc' },
      });
      const items = responseData.data ?? responseData;
      const fetched = (Array.isArray(items) ? items : []).map(mapEvent);
      setTotal(responseData.total ?? total);
      setPage(nextPage);
      setEvents((prev) => [...prev, ...fetched]);
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [page, total]);

  if (events.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More (${total - events.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}
