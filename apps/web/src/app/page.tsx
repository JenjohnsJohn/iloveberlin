'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleCard } from '@/components/articles/article-card';
import type { ArticleCardData } from '@/components/articles/article-card';
import { EventCard } from '@/components/events/event-card';
import type { EventCardData } from '@/components/events/event-card';
import { VideoCard } from '@/components/videos/video-card';
import type { VideoCardData } from '@/components/videos/video-card';
import apiClient from '@/lib/api-client';

// ─── Fallback Data ──────────────────────────────────────────

const FALLBACK_HERO_STORY = {
  slug: 'berlin-spring-festival-2026',
  title: 'Berlin Spring Festival 2026: Everything You Need to Know',
  excerpt:
    'The annual Berlin Spring Festival returns with over 200 events across the city. Here is your complete guide to the best exhibitions, performances, and experiences this season.',
  featuredImage: null as string | null,
  category: 'Things to Do',
  categorySlug: 'things-to-do',
};

const FALLBACK_TRENDING_ARTICLES: ArticleCardData[] = [
  {
    slug: 'berlin-new-art-exhibition-opens',
    title: 'Stunning New Art Exhibition Opens at Hamburger Bahnhof',
    excerpt:
      'The renowned contemporary art museum unveils a groundbreaking exhibition featuring works from international artists exploring urban identity.',
    featuredImage: null,
    category: 'Arts & Culture',
    categorySlug: 'arts-culture',
    author: { name: 'Anna Schmidt', avatarUrl: null },
    publishedAt: 'Mar 10, 2026',
    readTime: 5,
  },
  {
    slug: 'berlin-tech-startup-raises-funding',
    title: 'Berlin Tech Startup Raises \u20AC50M in Series B Funding',
    excerpt:
      'A promising Berlin-based AI startup has secured significant funding to expand its operations across Europe and beyond.',
    featuredImage: null,
    category: 'Technology',
    categorySlug: 'technology',
    author: { name: 'Marcus Weber', avatarUrl: null },
    publishedAt: 'Mar 9, 2026',
    readTime: 4,
  },
  {
    slug: 'kreuzberg-street-food-festival',
    title: 'Kreuzberg Street Food Festival Returns This Weekend',
    excerpt:
      'The beloved annual street food festival brings together over 100 vendors from around the world to the heart of Kreuzberg.',
    featuredImage: null,
    category: 'Things to Do',
    categorySlug: 'things-to-do',
    author: { name: 'Lisa Hoffmann', avatarUrl: null },
    publishedAt: 'Mar 8, 2026',
    readTime: 3,
  },
];

const FALLBACK_FEATURED_EVENTS: EventCardData[] = [
  {
    slug: 'berlin-art-week-2026',
    title: 'Berlin Art Week 2026',
    excerpt:
      'A week-long celebration of contemporary art featuring galleries, museums, and pop-up exhibitions across Berlin.',
    featuredImage: null,
    category: 'Arts & Culture',
    categorySlug: 'arts-culture',
    venueName: 'Various Locations',
    startDate: '2026-03-14',
    startTime: '10:00',
    endTime: '20:00',
    isFree: false,
    price: 15,
    priceMax: 45,
  },
  {
    slug: 'kreuzberg-street-food-market',
    title: 'Kreuzberg Street Food Market',
    excerpt:
      'Over 50 food vendors from around the world gather at Markthalle Neun for a weekend of culinary exploration.',
    featuredImage: null,
    category: 'Food & Dining',
    categorySlug: 'food-dining',
    venueName: 'Markthalle Neun',
    startDate: '2026-03-14',
    startTime: '11:00',
    endTime: '22:00',
    isFree: true,
    price: null,
    priceMax: null,
  },
  {
    slug: 'berlin-philharmonic-spring-concert',
    title: 'Berlin Philharmonic: Spring Gala Concert',
    excerpt:
      'An evening of classical masterpieces performed by one of the finest orchestras in the world.',
    featuredImage: null,
    category: 'Entertainment',
    categorySlug: 'entertainment',
    venueName: 'Berliner Philharmonie',
    startDate: '2026-03-15',
    startTime: '19:30',
    endTime: '22:00',
    isFree: false,
    price: 35,
    priceMax: 120,
  },
];

const FALLBACK_WEEKEND_PICKS: EventCardData[] = [
  {
    slug: 'techno-night-berghain-march',
    title: 'Panorama Bar: Spring Edition',
    excerpt:
      'An unforgettable night of techno and house music at one of the most iconic clubs in the world.',
    featuredImage: null,
    category: 'Nightlife',
    categorySlug: 'nightlife',
    venueName: 'Berghain',
    startDate: '2026-03-14',
    startTime: '23:59',
    endTime: null,
    isFree: false,
    price: 18,
    priceMax: null,
  },
  {
    slug: 'berlin-marathon-training-run',
    title: 'Berlin Marathon Community Training Run',
    excerpt:
      'Join fellow runners for a group training session through Tiergarten.',
    featuredImage: null,
    category: 'Sports',
    categorySlug: 'sports',
    venueName: 'Tiergarten',
    startDate: '2026-03-15',
    startTime: '08:00',
    endTime: '10:00',
    isFree: true,
    price: null,
    priceMax: null,
  },
];

const FALLBACK_DINING_HIGHLIGHTS = [
  {
    slug: 'coda-dessert-bar',
    name: 'CODA Dessert Dining',
    cuisineType: 'Dessert Bar',
    district: 'Neukoelln',
    priceRange: '\u20AC\u20AC\u20AC',
    rating: 4.8,
  },
  {
    slug: 'markthalle-neun',
    name: 'Markthalle Neun',
    cuisineType: 'Food Hall',
    district: 'Kreuzberg',
    priceRange: '\u20AC\u20AC',
    rating: 4.5,
  },
  {
    slug: 'mustafas-gemuese-kebab',
    name: 'Mustafas Gemuese Kebab',
    cuisineType: 'Street Food',
    district: 'Kreuzberg',
    priceRange: '\u20AC',
    rating: 4.6,
  },
];

const FALLBACK_LATEST_VIDEOS: VideoCardData[] = [
  {
    slug: 'best-currywurst-in-berlin',
    title: 'The Best Currywurst in Berlin - A Local\'s Guide',
    thumbnailUrl: null,
    seriesName: 'BTips',
    seriesSlug: 'btips',
    durationSeconds: 480,
    publishedAt: '2026-03-10T12:00:00Z',
    videoProvider: 'youtube',
  },
  {
    slug: 'dine-out-kreuzberg-special',
    title: 'Dine Out: Kreuzberg\'s Hidden Gems',
    thumbnailUrl: null,
    seriesName: 'Dine Out Berlin',
    seriesSlug: 'dine-out-berlin',
    durationSeconds: 720,
    publishedAt: '2026-03-08T12:00:00Z',
    videoProvider: 'youtube',
  },
  {
    slug: 'made-in-berlin-craft-beer',
    title: 'Made in Berlin: The Craft Beer Revolution',
    thumbnailUrl: null,
    seriesName: 'Made in Berlin',
    seriesSlug: 'made-in-berlin',
    durationSeconds: 600,
    publishedAt: '2026-03-06T12:00:00Z',
    videoProvider: 'youtube',
  },
];

const FALLBACK_COMPETITIONS = [
  {
    slug: 'win-berlin-art-week-vip-passes',
    title: 'Win VIP Passes to Berlin Art Week 2026',
    prize: '2x VIP Passes (worth \u20AC200)',
    endsAt: 'Mar 13, 2026',
  },
  {
    slug: 'win-dinner-for-two-coda',
    title: 'Win a Dinner for Two at CODA Dessert Bar',
    prize: 'Dinner for 2 (worth \u20AC150)',
    endsAt: 'Mar 20, 2026',
  },
];

const FALLBACK_CLASSIFIEDS = [
  {
    slug: 'furnished-apartment-mitte',
    title: 'Furnished 2-Room Apartment in Mitte',
    category: 'Housing',
    price: '\u20AC1,200/mo',
  },
  {
    slug: 'vintage-bicycle-kreuzberg',
    title: 'Vintage Bicycle - Great Condition',
    category: 'For Sale',
    price: '\u20AC180',
  },
  {
    slug: 'german-language-exchange',
    title: 'German-English Language Exchange Partner Wanted',
    category: 'Community',
    price: 'Free',
  },
];

// ─── Section Header Component ──────────────────────────────

function SectionHeader({
  title,
  href,
  linkText = 'View all',
}: {
  title: string;
  href: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      <Link
        href={href}
        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-all flex items-center gap-1 group/link"
      >
        {linkText}
        <svg
          className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

// ─── Sections Grid ─────────────────────────────────────────

const SECTIONS = [
  {
    title: 'News',
    desc: 'Latest Berlin stories',
    href: '/news',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    title: 'Events',
    desc: "What's happening in Berlin",
    href: '/events',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Dining',
    desc: 'Best restaurants & cafes',
    href: '/dining',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Guide',
    desc: 'Essential Berlin knowledge',
    href: '/guide',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Videos',
    desc: 'Berlin video stories',
    href: '/videos',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Competitions',
    desc: 'Win amazing prizes',
    href: '/competitions',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

// ─── Homepage ──────────────────────────────────────────────

export default function HomePage() {
  const [heroStory, setHeroStory] = useState(FALLBACK_HERO_STORY);
  const [trendingArticles, setTrendingArticles] = useState<ArticleCardData[]>(FALLBACK_TRENDING_ARTICLES);
  const [featuredEvents, setFeaturedEvents] = useState<EventCardData[]>(FALLBACK_FEATURED_EVENTS);
  const [weekendPicks, setWeekendPicks] = useState<EventCardData[]>(FALLBACK_WEEKEND_PICKS);
  const [diningHighlights, setDiningHighlights] = useState(FALLBACK_DINING_HIGHLIGHTS);
  const [latestVideos, setLatestVideos] = useState<VideoCardData[]>(FALLBACK_LATEST_VIDEOS);
  const [competitions, setCompetitions] = useState(FALLBACK_COMPETITIONS);
  const [classifieds, setClassifieds] = useState(FALLBACK_CLASSIFIEDS);

  useEffect(() => {
    async function fetchHomepageData() {
      // Fetch all sections in parallel, each with its own try/catch so failures are independent
      const [
        articlesResult,
        eventsResult,
        diningResult,
        videosResult,
        competitionsResult,
        classifiedsResult,
      ] = await Promise.allSettled([
        apiClient.get('/articles', { params: { limit: 4, sort: 'created_at', order: 'DESC' } }),
        apiClient.get('/events', { params: { limit: 4, status: 'published' } }),
        apiClient.get('/dining/restaurants', { params: { limit: 3, status: 'published' } }),
        apiClient.get('/videos', { params: { limit: 3, status: 'published' } }),
        apiClient.get('/competitions', { params: { limit: 2, status: 'active' } }),
        apiClient.get('/classifieds', { params: { limit: 3, status: 'active' } }),
      ]);

      // Trending articles & hero story
      if (articlesResult.status === 'fulfilled') {
        const articles = articlesResult.value.data?.data ?? articlesResult.value.data;
        if (Array.isArray(articles) && articles.length > 0) {
          // Use first article as hero story
          const first = articles[0];
          setHeroStory({
            slug: first.slug,
            title: first.title,
            excerpt: first.excerpt || first.summary || '',
            featuredImage: first.featured_image || first.featuredImage || null,
            category: first.category?.name || first.category || 'News',
            categorySlug: first.category?.slug || first.categorySlug || 'news',
          });
          // Use remaining articles as trending (or all if only a few)
          const trending = articles.slice(0, 4).map((a: Record<string, unknown>) => ({
            slug: a.slug as string,
            title: a.title as string,
            excerpt: (a.excerpt || a.summary || '') as string,
            featuredImage: (a.featured_image || a.featuredImage || null) as string | null,
            category: ((a.category as Record<string, unknown>)?.name || a.category || '') as string,
            categorySlug: ((a.category as Record<string, unknown>)?.slug || a.categorySlug || '') as string,
            author: {
              name: ((a.author as Record<string, unknown>)?.name || (a.author as Record<string, unknown>)?.username || 'Staff Writer') as string,
              avatarUrl: ((a.author as Record<string, unknown>)?.avatar_url || (a.author as Record<string, unknown>)?.avatarUrl || null) as string | null,
            },
            publishedAt: (a.published_at || a.publishedAt || a.created_at || a.createdAt || '') as string,
            readTime: (a.read_time || a.readTime || 4) as number,
          }));
          setTrendingArticles(trending);
        }
      }

      // Featured events & weekend picks
      if (eventsResult.status === 'fulfilled') {
        const events = eventsResult.value.data?.data ?? eventsResult.value.data;
        if (Array.isArray(events) && events.length > 0) {
          const mapped = events.map((e: Record<string, unknown>) => ({
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
          setFeaturedEvents(mapped.slice(0, 3));
          // Use first 2 events as weekend picks
          setWeekendPicks(mapped.slice(0, 2));
        }
      }

      // Dining highlights
      if (diningResult.status === 'fulfilled') {
        const restaurants = diningResult.value.data?.data ?? diningResult.value.data;
        if (Array.isArray(restaurants) && restaurants.length > 0) {
          const mapped = restaurants.map((r: Record<string, unknown>) => ({
            slug: r.slug as string,
            name: (r.name || r.title || '') as string,
            cuisineType: (r.cuisine_type || r.cuisineType || '') as string,
            district: (r.district || '') as string,
            priceRange: (r.price_range || r.priceRange || '') as string,
            rating: (r.rating || 0) as number,
          }));
          setDiningHighlights(mapped);
        }
      }

      // Latest videos
      if (videosResult.status === 'fulfilled') {
        const videos = videosResult.value.data?.data ?? videosResult.value.data;
        if (Array.isArray(videos) && videos.length > 0) {
          const mapped = videos.map((v: Record<string, unknown>) => ({
            slug: v.slug as string,
            title: v.title as string,
            thumbnailUrl: (v.thumbnail_url || v.thumbnailUrl || null) as string | null,
            seriesName: ((v.series as Record<string, unknown>)?.name || v.series_name || v.seriesName || null) as string | null,
            seriesSlug: ((v.series as Record<string, unknown>)?.slug || v.series_slug || v.seriesSlug || null) as string | null,
            durationSeconds: (v.duration_seconds || v.durationSeconds || v.duration || null) as number | null,
            publishedAt: (v.published_at || v.publishedAt || null) as string | null,
            videoProvider: (v.video_provider || v.videoProvider || 'youtube') as string,
          }));
          setLatestVideos(mapped);
        }
      }

      // Competitions
      if (competitionsResult.status === 'fulfilled') {
        const comps = competitionsResult.value.data?.data ?? competitionsResult.value.data;
        if (Array.isArray(comps) && comps.length > 0) {
          const mapped = comps.map((c: Record<string, unknown>) => ({
            slug: c.slug as string,
            title: c.title as string,
            prize: (c.prize || c.prize_description || '') as string,
            endsAt: (c.ends_at || c.endsAt || c.end_date || c.endDate || '') as string,
          }));
          setCompetitions(mapped);
        }
      }

      // Classifieds
      if (classifiedsResult.status === 'fulfilled') {
        const items = classifiedsResult.value.data?.data ?? classifiedsResult.value.data;
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map((item: Record<string, unknown>) => ({
            slug: item.slug as string,
            title: item.title as string,
            category: ((item.category as Record<string, unknown>)?.name || item.category || '') as string,
            price: (item.price || item.price_display || '') as string,
          }));
          setClassifieds(mapped);
        }
      }
    }

    fetchHomepageData();
  }, []);

  return (
    <div>
      {/* Hero Section with Featured Story */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                Featured Story
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {heroStory.title}
              </h1>
              <p className="text-lg text-white/80 mb-6 max-w-xl">
                {heroStory.excerpt}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href={`/news/${heroStory.slug}`}
                  className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Read More
                </Link>
                <Link
                  href="/events"
                  className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
                >
                  Explore Events
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/10">
              {heroStory.featuredImage ? (
                <img
                  src={heroStory.featuredImage}
                  alt={heroStory.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-primary-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                {heroStory.category}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SECTIONS.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:scale-[1.02] hover:shadow-primary-glow transition-all duration-300 text-center group"
            >
              <div className="text-gray-400 group-hover:text-primary-600 transition-colors mb-3">
                {section.icon}
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                {section.title}
              </h2>
              <p className="text-xs text-gray-500">{section.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending in Berlin */}
      <section className="bg-primary-50/40 py-12">
        <div className="container mx-auto px-4">
          <SectionHeader title="Trending in Berlin" href="/news" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container mx-auto px-4 py-12">
        <SectionHeader title="Featured Events" href="/events" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      {/* Weekend Picks */}
      <section className="bg-primary-50/40 py-12">
        <div className="container mx-auto px-4">
          <SectionHeader title="Weekend Picks" href="/events" linkText="See all weekend events" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weekendPicks.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Dining Highlights */}
      <section className="container mx-auto px-4 py-12">
        <SectionHeader title="Dining Highlights" href="/dining" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {diningHighlights.map((restaurant) => (
            <Link
              key={restaurant.slug}
              href={`/dining/${restaurant.slug}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                  <svg className="w-12 h-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                  {restaurant.cuisineType}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                  {restaurant.name}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{restaurant.district}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">{restaurant.rating}</span>
                    <span className="text-gray-400">{restaurant.priceRange}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Videos */}
      <section className="bg-primary-50/40 py-12">
        <div className="container mx-auto px-4">
          <SectionHeader title="Latest Videos" href="/videos" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestVideos.map((video) => (
              <VideoCard key={video.slug} video={video} />
            ))}
          </div>
        </div>
      </section>

      {/* Active Competitions */}
      <section className="container mx-auto px-4 py-12">
        <SectionHeader title="Active Competitions" href="/competitions" linkText="See all competitions" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitions.map((comp) => (
            <Link
              key={comp.slug}
              href={`/competitions/${comp.slug}`}
              className="group flex items-center gap-6 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-primary-glow hover:border-primary-200 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                  {comp.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Prize: {comp.prize}
                </p>
                <p className="text-xs text-gray-400">
                  Ends: {comp.endsAt}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Classifieds */}
      <section className="bg-primary-50/40 py-12">
        <div className="container mx-auto px-4">
          <SectionHeader title="Featured Classifieds" href="/classifieds" linkText="Browse all classifieds" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classifieds.map((item) => (
              <Link
                key={item.slug}
                href={`/classifieds/${item.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-primary-glow hover:border-primary-200 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-3">
                  {item.category}
                </span>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-lg font-bold text-primary-600">
                  {item.price}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
