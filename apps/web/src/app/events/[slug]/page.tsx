import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventContent } from './event-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string | null;
  featured_image: { url: string } | null;
  category: { name: string; slug: string } | null;
  venue: { name: string; address: string; district: string | null; latitude: number | null; longitude: number | null } | null;
  submitter: { id: string; display_name: string; avatar_url: string | null } | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  is_free: boolean;
  price: number | null;
  price_max: number | null;
  ticket_url: string | null;
  view_count: number;
}

async function getEvent(slug: string): Promise<EventData | null> {
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
    return null;
  } catch {
    return null;
  }
}

function formatDateISO(dateStr: string): string {
  return `${dateStr}T00:00:00+01:00`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event Not Found' };

  return {
    title: event.title,
    description: event.excerpt || undefined,
    openGraph: {
      title: event.title,
      description: event.excerpt || undefined,
      type: 'website',
      images: event.featured_image ? [event.featured_image.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.excerpt || undefined,
    },
    alternates: {
      canonical: `https://iloveberlin.biz/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.excerpt || event.description?.replace(/<[^>]*>/g, '').slice(0, 200),
    startDate: event.start_time
      ? `${event.start_date}T${event.start_time}:00+01:00`
      : formatDateISO(event.start_date),
    endDate: event.end_date
      ? event.end_time
        ? `${event.end_date}T${event.end_time}:00+01:00`
        : formatDateISO(event.end_date)
      : undefined,
    image: event.featured_image?.url,
    location: event.venue
      ? {
          '@type': 'Place',
          name: event.venue.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.venue.address,
            addressLocality: 'Berlin',
            addressCountry: 'DE',
          },
          ...(event.venue.latitude && event.venue.longitude
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: event.venue.latitude,
                  longitude: event.venue.longitude,
                },
              }
            : {}),
        }
      : undefined,
    offers: event.is_free
      ? { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' }
      : event.price
        ? {
            '@type': 'Offer',
            price: String(event.price),
            priceCurrency: 'EUR',
            url: event.ticket_url || undefined,
            availability: 'https://schema.org/InStock',
          }
        : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'ILoveBerlin',
      url: 'https://iloveberlin.biz',
    },
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventContent
        event={{
          id: event.id,
          slug: event.slug,
          title: event.title,
          description: event.description,
          excerpt: event.excerpt,
          featuredImage: event.featured_image?.url || null,
          category: event.category?.name || 'General',
          categorySlug: event.category?.slug || 'general',
          venue: event.venue || { name: 'TBA', address: '', district: null },
          organizer: event.submitter?.display_name || null,
          startDate: event.start_date,
          endDate: event.end_date,
          startTime: event.start_time,
          endTime: event.end_time,
          isFree: event.is_free,
          price: event.price,
          priceMax: event.price_max,
          ticketUrl: event.ticket_url,
        }}
      />
    </>
  );
}
