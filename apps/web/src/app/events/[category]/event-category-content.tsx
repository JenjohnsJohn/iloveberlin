'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { EventCard } from '@/components/events/event-card';
import type { EventCardData } from '@/components/events/event-card';
import apiClient from '@/lib/api-client';

const DATE_TABS = ['Today', 'This Weekend', 'This Week', 'This Month', 'All'] as const;
const ALL_DISTRICT = { name: 'All Districts', value: '' };

function getDateRange(tab: string): { date_from?: string; date_to?: string } {
  if (tab === 'All') return {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const toISO = (d: Date) => d.toISOString().split('T')[0];

  if (tab === 'Today') {
    const todayStr = toISO(today);
    return { date_from: todayStr, date_to: todayStr };
  }
  if (tab === 'This Weekend') {
    const dayOfWeek = today.getDay();
    const saturday = new Date(today);
    if (dayOfWeek === 0) saturday.setDate(today.getDate() - 1);
    else if (dayOfWeek !== 6) saturday.setDate(today.getDate() + (6 - dayOfWeek));
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    return { date_from: toISO(saturday), date_to: toISO(sunday) };
  }
  if (tab === 'This Week') {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return { date_from: toISO(today), date_to: toISO(weekEnd) };
  }
  if (tab === 'This Month') {
    const monthEnd = new Date(today);
    monthEnd.setDate(today.getDate() + 30);
    return { date_from: toISO(today), date_to: toISO(monthEnd) };
  }
  return {};
}

interface EventCategoryContentProps {
  categorySlug: string;
  categoryName: string;
}

export function EventCategoryContent({ categorySlug, categoryName }: EventCategoryContentProps) {
  const [activeDateTab, setActiveDateTab] = useState<string>('All');
  const [activeDistrict, setActiveDistrict] = useState('');
  const [districts, setDistricts] = useState<{ name: string; value: string }[]>([ALL_DISTRICT]);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  useEffect(() => {
    apiClient.get('/events/venues/list').then(({ data }) => {
      const venues = Array.isArray(data) ? data : data.data ?? [];
      const uniqueDistricts = new Set<string>();
      venues.forEach((v: Record<string, unknown>) => {
        if (v.district && typeof v.district === 'string') uniqueDistricts.add(v.district);
      });
      const districtItems = Array.from(uniqueDistricts).sort().map((d) => ({ name: d, value: d }));
      setDistricts([ALL_DISTRICT, ...districtItems]);
    }).catch(() => {});
  }, []);

  const fetchEvents = useCallback(async (pageNum: number, district: string, dateTab: string, append: boolean) => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page: pageNum, limit, category: categorySlug };
      if (district) params.district = district;
      const dateRange = getDateRange(dateTab);
      if (dateRange.date_from) params.date_from = dateRange.date_from;
      if (dateRange.date_to) params.date_to = dateRange.date_to;

      const { data: responseData } = await apiClient.get('/events', { params });
      const fetchedEvents: EventCardData[] = (responseData.data ?? responseData).map(
        (e: Record<string, unknown>) => ({
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
        }),
      );
      const totalCount = responseData.total ?? 0;
      setTotal(totalCount);
      setHasMore(pageNum * limit < totalCount);
      if (append) {
        setEvents((prev) => [...prev, ...fetchedEvents]);
      } else {
        setEvents(fetchedEvents);
      }
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    setPage(1);
    fetchEvents(1, activeDistrict, activeDateTab, false);
  }, [activeDistrict, activeDateTab, fetchEvents]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, activeDistrict, activeDateTab, true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
            { label: categoryName },
          ]}
        />
      </div>

      <section className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <p className="text-lg text-gray-600">
          Discover the best {categoryName.toLowerCase()} events in Berlin.
        </p>
      </section>

      {/* Date Tabs */}
      <section className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {DATE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveDateTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeDateTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* District Filter */}
      <section className="mb-8">
        <select
          value={activeDistrict}
          onChange={(e) => setActiveDistrict(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {districts.map((d) => (
            <option key={d.value} value={d.value}>{d.name}</option>
          ))}
        </select>
      </section>

      {/* Events Grid */}
      <section>
        {loading && events.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No events found in this category.
            </p>
          </div>
        )}
      </section>

      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load More Events (${total - events.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
