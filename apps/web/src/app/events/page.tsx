import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toEventCategorySeoSlug } from '@/lib/events-seo-utils';
import { LatestEventList } from './latest-event-list';
import type { EventCardData } from '@/components/events/event-card';

export const metadata: Metadata = {
  title: 'Berlin Events',
  description:
    'Discover the best events happening in Berlin. From art exhibitions to nightlife, find your next experience.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCategories(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=event`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data ?? [];
      return items.map((c: Record<string, unknown>) => ({
        name: String(c.name || ''),
        slug: String(c.slug || ''),
        icon: (c.icon || null) as string | null,
        description: (c.description || null) as string | null,
        listing_count: typeof c.listing_count === 'number' ? c.listing_count : undefined,
        children: Array.isArray(c.children)
          ? (c.children as Record<string, unknown>[]).map((child) => ({
              name: String(child.name || ''),
              slug: String(child.slug || ''),
              listing_count: typeof child.listing_count === 'number' ? child.listing_count : undefined,
            }))
          : [],
      }));
    }
  } catch (err) {
    console.error('Failed to load event categories:', err);
  }
  return [];
}

async function getLatestEvents(): Promise<{ events: EventCardData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/events?limit=6&sort=date&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const events = (items as Record<string, unknown>[]).map((e) => ({
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
      }));
      return { events, total };
    }
  } catch (err) {
    console.error('Failed to load latest events:', err);
  }
  return { events: [], total: 0 };
}

export default async function EventsPage() {
  const [categories, { events: latestEvents, total: eventsTotal }] = await Promise.all([
    getCategories(),
    getLatestEvents(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Berlin Events
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Discover the best events happening in Berlin. From art exhibitions to
          nightlife, find your next experience.
        </p>
      </section>

      {/* Category Grid */}
      <section>
        <CategoryGrid
          categories={categories}
          basePath="/events"
          slugTransform={toEventCategorySeoSlug}
          emptyMessage="No event categories available yet. Check back soon!"
        />
      </section>

      <LatestEventList initialEvents={latestEvents} initialTotal={eventsTotal} />
    </div>
  );
}
