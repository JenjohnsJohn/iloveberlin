'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { EventCard } from '@/components/events/event-card';
import type { EventCardData } from '@/components/events/event-card';
import { sanitizeHtml } from '@/lib/sanitize';
import apiClient from '@/lib/api-client';
import { buildEventUrl, buildEventCategoryUrl } from '@/lib/events-seo-utils';
import { formatDateLong, formatTime } from '@/lib/format-date';

interface EventContentProps {
  event: {
    id: string;
    slug: string;
    title: string;
    description: string;
    excerpt: string | null;
    featuredImage: string | null;
    category: string;
    categorySlug: string;
    venue: { name: string; address: string; district: string | null };
    organizer: string | null;
    startDate: string;
    endDate: string | null;
    startTime: string | null;
    endTime: string | null;
    isFree: boolean;
    price: number | null;
    priceMax: number | null;
    ticketUrl: string | null;
  };
}


function formatPrice(isFree: boolean, price: number | null, priceMax: number | null): string {
  if (isFree) return 'Free';
  if (price && priceMax && priceMax > price) {
    return `\u20AC${Number(price).toFixed(0)} \u2013 \u20AC${Number(priceMax).toFixed(0)}`;
  }
  if (price) return `\u20AC${Number(price).toFixed(2)}`;
  return 'Price TBA';
}

function generateIcsContent(event: EventContentProps['event']): string {
  const start = event.startTime
    ? `${event.startDate.replace(/-/g, '')}T${event.startTime.replace(/:/g, '')}00`
    : `${event.startDate.replace(/-/g, '')}`;
  const end = event.endDate
    ? event.endTime
      ? `${event.endDate.replace(/-/g, '')}T${event.endTime.replace(/:/g, '')}00`
      : `${event.endDate.replace(/-/g, '')}`
    : event.endTime
      ? `${event.startDate.replace(/-/g, '')}T${event.endTime.replace(/:/g, '')}00`
      : start;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//I♥Berlin//Events//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replace(/[,;\\]/g, '')}`,
    `LOCATION:${event.venue.name}, ${event.venue.address}`.replace(/[,;\\]/g, ''),
    `DESCRIPTION:${(event.excerpt || '').replace(/[,;\\]/g, '')}`,
    `URL:https://iloveberlin.biz${buildEventUrl(event.slug, event.categorySlug)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function handleAddToCalendar(event: EventContentProps['event']) {
  const ics = generateIcsContent(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.slug}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function EventContent({ event }: EventContentProps) {
  const [relatedEvents, setRelatedEvents] = useState<EventCardData[]>([]);

  // Track page view on mount
  useEffect(() => {
    apiClient.post(`/events/${event.slug}/view`).catch(() => {
      // Silently ignore view tracking errors
    });
  }, [event.slug]);

  // Fetch related events from API
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const { data } = await apiClient.get(`/events/${event.id}/related`);
        const items = Array.isArray(data) ? data : data.data ?? [];
        setRelatedEvents(
          items.slice(0, 4).map((e: Record<string, unknown>) => {
            const venue = e.venue as Record<string, unknown> | null;
            const cat = e.category as Record<string, unknown> | null;
            return {
              slug: String(e.slug || ''),
              title: String(e.title || ''),
              excerpt: String(e.excerpt || ''),
              featuredImage: ((e.featured_image as Record<string, unknown>)?.url || e.featured_image || e.featuredImage || null) as string | null,
              category: String(cat?.name || ''),
              categorySlug: String(cat?.slug || ''),
              venueName: String(venue?.name || '') || null,
              startDate: String(e.start_date || e.startDate || ''),
              startTime: (e.start_time ?? e.startTime ?? null) as string | null,
              endTime: (e.end_time ?? e.endTime ?? null) as string | null,
              isFree: Boolean(e.is_free ?? e.isFree ?? false),
              price: e.price != null ? Number(e.price) : null,
              priceMax: (e.price_max ?? e.priceMax ?? null) as number | null,
            };
          })
        );
      } catch {
        // Silently ignore - related events are non-critical
      }
    };
    if (event.id) fetchRelated();
  }, [event.id]);

  return (
    <div>
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-primary-100 to-primary-300">
        {event.featuredImage ? (
          <img
            src={event.featuredImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="py-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Events', href: '/events' },
              ...(event.category ? [{ label: event.category, href: buildEventCategoryUrl(event.categorySlug) }] : []),
              { label: event.title },
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <header className="mb-8">
            {event.category && (
              <Link
                href={buildEventCategoryUrl(event.categorySlug)}
                className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4 hover:bg-primary-200 transition-colors"
              >
                {event.category}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {event.title}
            </h1>

            {event.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{event.excerpt}</p>
            )}

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl mb-6">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-600">{formatDateLong(event.startDate)}</p>
                  {event.endDate && event.endDate !== event.startDate && (
                    <p className="text-sm text-gray-600">to {formatDateLong(event.endDate)}</p>
                  )}
                  {event.startTime && (
                    <p className="text-sm text-gray-500">
                      {formatTime(event.startTime)}
                      {event.endTime ? ` \u2013 ${formatTime(event.endTime)}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Venue</p>
                  <p className="text-sm text-gray-600">{event.venue.name}</p>
                  <p className="text-sm text-gray-500">{event.venue.address}</p>
                  {event.venue.district && (
                    <p className="text-sm text-gray-500">{event.venue.district}</p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Price</p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(event.isFree, event.price, event.priceMax)}
                  </p>
                </div>
              </div>

              {/* Organizer */}
              {event.organizer && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Organizer</p>
                    <p className="text-sm text-gray-600">{event.organizer}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              {event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Get Tickets
                </a>
              )}
              <button
                onClick={() => handleAddToCalendar(event)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add to Calendar
              </button>
              <BookmarkButton articleId={event.id} />
            </div>
          </header>

          {/* Event Description */}
          <div
            className="prose prose-lg max-w-none mb-8 prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 hover:prose-a:text-primary-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
          />

          {/* Map Placeholder */}
          <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-gray-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-500 font-medium">Map view coming soon</p>
                <p className="text-sm text-gray-400 mt-1">{event.venue.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <section className="max-w-5xl mx-auto pb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((relEvent) => (
                <EventCard key={relEvent.slug} event={relEvent} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
