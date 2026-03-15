'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArticleCard } from '@/components/articles/article-card';
import type { ArticleCardData } from '@/components/articles/article-card';
import { EventCard } from '@/components/events/event-card';
import type { EventCardData } from '@/components/events/event-card';
import { VideoCard } from '@/components/videos/video-card';
import type { VideoCardData } from '@/components/videos/video-card';
import { CompetitionCard } from '@/components/competitions/competition-card';
import type { CompetitionCardData } from '@/components/competitions/competition-card';
import { RestaurantCard } from '@/components/dining/restaurant-card';
import type { RestaurantCardData } from '@/components/dining/restaurant-card';
import { AdBanner } from '@/components/ads/ad-banner';
import { formatDate } from '@/lib/format-date';
import { buildGuideUrl } from '@/lib/guide-seo-utils';
import apiClient from '@/lib/api-client';
import { buildArticleUrl } from '@/lib/news-seo-utils';
import { buildRestaurantUrl } from '@/lib/dining-seo-utils';
import { buildEventUrl } from '@/lib/events-seo-utils';
import { buildVideoUrl } from '@/lib/videos-seo-utils';
import { buildCompetitionUrl } from '@/lib/competitions-seo-utils';

// ─── Types ──────────────────────────────────────────────────

interface ResolvedHomepageItem {
  id: string;
  content_type: string;
  content_id: string;
  sort_order: number;
  title: string;
  slug: string;
  image_url: string | null;
  excerpt: string | null;
  category_name: string | null;
  category_slug: string | null;
  extra: Record<string, unknown>;
}

interface CuratedSections {
  hero: ResolvedHomepageItem[];
  trending: ResolvedHomepageItem[];
  events: ResolvedHomepageItem[];
  weekend: ResolvedHomepageItem[];
  dining: ResolvedHomepageItem[];
  videos: ResolvedHomepageItem[];
  competitions: ResolvedHomepageItem[];
  classifieds: ResolvedHomepageItem[];
}

interface HeroSlide {
  key: string;
  label: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  linkHref: string;
  linkText: string;
  secondaryHref: string;
  secondaryText: string;
  gradient: string;
  categoryTag: string;
}

interface ClassifiedItem {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  price: number | null;
  priceType: string;
  imageUrl: string | null;
  location: string | null;
  condition: string | null;
  featured: boolean;
}

interface DiningOfferItem {
  id: string;
  title: string;
  description: string;
  endDate: string;
  restaurant: {
    slug: string;
    name: string;
    featuredImage: string | null;
    primaryCuisineSlug: string | null;
    district: string;
  };
}

interface GuideItem {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  topicSlug: string;
  lastReviewed: string;
}

interface StoreProductItem {
  slug: string;
  name: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string;
  categorySlug: string;
  isFeatured: boolean;
}

// ─── Helpers ────────────────────────────────────────────────

function formatClassifiedPrice(price: number | null, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'Price on request';
  if (price == null) return 'Price on request';
  return `€${price.toLocaleString('de-DE')}`;
}

function formatCondition(condition: string | null): string | null {
  if (!condition) return null;
  const map: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };
  return map[condition] || condition;
}

// ─── Curated Item Mappers ───────────────────────────────────

function curatedToArticleCard(item: ResolvedHomepageItem): ArticleCardData {
  return {
    slug: item.slug,
    title: item.title,
    excerpt: (item.excerpt || '') as string,
    featuredImage: item.image_url,
    category: item.category_name || '',
    categorySlug: item.category_slug || '',
    author: {
      name: (item.extra.author_name as string) || 'Staff Writer',
      avatarUrl: (item.extra.author_avatar_url as string) || null,
    },
    publishedAt: (item.extra.published_at as string) || '',
    readTime: (item.extra.read_time_minutes as number) || 4,
  };
}

function curatedToEventCard(item: ResolvedHomepageItem): EventCardData {
  return {
    slug: item.slug,
    title: item.title,
    excerpt: (item.excerpt || '') as string,
    featuredImage: item.image_url,
    category: item.category_name || '',
    categorySlug: item.category_slug || '',
    venueName: (item.extra.venue_name as string) || null,
    startDate: (item.extra.start_date as string) || '',
    startTime: (item.extra.start_time as string) || null,
    endTime: (item.extra.end_time as string) || null,
    isFree: (item.extra.is_free as boolean) ?? false,
    price: (item.extra.price as number) ?? null,
    priceMax: (item.extra.price_max as number) ?? null,
  };
}

function curatedToRestaurantCard(item: ResolvedHomepageItem): RestaurantCardData {
  const cuisines = (item.extra.cuisines as string[]) || [];
  const cuisineSlugs = (item.extra.cuisine_slugs as string[]) || [];
  const rawPrice = (item.extra.price_range as string) || 'moderate';
  const validPriceRanges = ['budget', 'moderate', 'upscale', 'fine_dining'] as const;
  const priceRange = validPriceRanges.includes(rawPrice as typeof validPriceRanges[number])
    ? rawPrice as RestaurantCardData['priceRange']
    : 'moderate';
  return {
    slug: item.slug,
    name: item.title,
    description: (item.excerpt || '') as string,
    featuredImage: item.image_url,
    cuisines,
    primaryCuisineSlug: cuisineSlugs[0] || item.category_slug || null,
    district: (item.extra.district as string) || null,
    priceRange,
    rating: item.extra.rating != null ? Number(item.extra.rating) : null,
  };
}

function curatedToVideoCard(item: ResolvedHomepageItem): VideoCardData {
  return {
    slug: item.slug,
    title: item.title,
    thumbnailUrl: item.image_url,
    seriesName: (item.extra.series_name as string) || null,
    seriesSlug: (item.extra.series_slug as string) || null,
    durationSeconds: (item.extra.duration_seconds as number) || null,
    publishedAt: (item.extra.published_at as string) || null,
    videoProvider: (item.extra.video_provider as string) || 'youtube',
  };
}

function curatedToCompetitionCard(item: ResolvedHomepageItem): CompetitionCardData {
  return {
    slug: item.slug,
    title: item.title,
    description: (item.excerpt || '') as string,
    prizeDescription: (item.extra.prize_description as string) || null,
    featuredImage: item.image_url,
    endDate: (item.extra.end_date as string) || '',
    entryCount: 0,
    status: (item.extra.status as string) || 'active',
    winnerName: null,
    categorySlug: item.category_slug || null,
  };
}

function curatedToClassifiedItem(item: ResolvedHomepageItem): ClassifiedItem {
  return {
    slug: item.slug,
    title: item.title,
    category: item.category_name || '',
    categorySlug: item.category_slug || 'general',
    price: item.extra.price != null ? Number(item.extra.price) : null,
    priceType: (item.extra.price_type as string) || 'fixed',
    imageUrl: item.image_url,
    location: (item.extra.location as string) || null,
    condition: (item.extra.condition as string) || null,
    featured: (item.extra.featured as boolean) || false,
  };
}

// Hero slide config mapping from content_type to HERO_SLIDE_CONFIG key
const CONTENT_TYPE_TO_HERO_KEY: Record<string, keyof typeof HERO_SLIDE_CONFIG> = {
  article: 'news',
  event: 'events',
  restaurant: 'dining',
  guide: 'guide',
  video: 'videos',
  competition: 'competitions',
  classified: 'classifieds',
  product: 'store',
};

function curatedItemToHeroSlide(item: ResolvedHomepageItem): HeroSlide | null {
  const heroKey = CONTENT_TYPE_TO_HERO_KEY[item.content_type];
  if (!heroKey) return null;
  const cfg = HERO_SLIDE_CONFIG[heroKey];

  let linkHref = '/';
  switch (item.content_type) {
    case 'article':
      linkHref = buildArticleUrl(item.slug, item.category_slug || '');
      break;
    case 'event':
      linkHref = buildEventUrl(item.slug, item.category_slug || '');
      break;
    case 'restaurant':
      linkHref = buildRestaurantUrl(item.slug, item.category_slug || null);
      break;
    case 'video':
      linkHref = buildVideoUrl(item.slug, (item.extra.series_slug as string) || null);
      break;
    case 'competition':
      linkHref = buildCompetitionUrl(item.slug, item.category_slug || null);
      break;
    case 'classified':
      linkHref = `/classifieds/${item.category_slug || 'general'}/${item.slug}`;
      break;
    case 'guide':
      linkHref = buildGuideUrl(item.slug, (item.extra.topic_slug as string) || item.category_slug || '');
      break;
    case 'product':
      linkHref = `/store/${item.category_slug || 'all'}/${item.slug}`;
      break;
  }

  return {
    key: `curated-${item.content_type}-${item.content_id}`,
    label: cfg.label,
    title: item.title,
    excerpt: item.excerpt || '',
    imageUrl: item.image_url,
    linkHref,
    linkText: cfg.linkText,
    secondaryHref: cfg.secondaryHref,
    secondaryText: cfg.secondaryText,
    gradient: cfg.gradient,
    categoryTag: item.category_name || item.content_type,
  };
}

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
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
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

const STATS = [
  { label: 'Events Monthly', value: '500+' },
  { label: 'Restaurants', value: '1,200+' },
  { label: 'Active Members', value: '25K+' },
  { label: 'Berlin Guides', value: '150+' },
];

const HERO_SLIDE_CONFIG = {
  news: {
    gradient: 'from-primary-500 to-primary-700',
    label: 'Featured Story',
    linkText: 'Read More',
    secondaryText: 'Browse News',
    secondaryHref: '/news',
  },
  events: {
    gradient: 'from-rose-500 to-rose-700',
    label: 'Featured Event',
    linkText: 'View Event',
    secondaryText: 'Browse Events',
    secondaryHref: '/events',
  },
  dining: {
    gradient: 'from-emerald-500 to-emerald-700',
    label: 'Dining Highlight',
    linkText: 'View Restaurant',
    secondaryText: 'Browse Dining',
    secondaryHref: '/dining',
  },
  guide: {
    gradient: 'from-sky-500 to-sky-700',
    label: 'Berlin Guide',
    linkText: 'Read Guide',
    secondaryText: 'Browse Guides',
    secondaryHref: '/guide',
  },
  videos: {
    gradient: 'from-violet-500 to-violet-700',
    label: 'Latest Video',
    linkText: 'Watch Now',
    secondaryText: 'Browse Videos',
    secondaryHref: '/videos',
  },
  competitions: {
    gradient: 'from-amber-500 to-amber-700',
    label: 'Win Prizes',
    linkText: 'Enter Now',
    secondaryText: 'Browse Competitions',
    secondaryHref: '/competitions',
  },
  classifieds: {
    gradient: 'from-slate-500 to-slate-700',
    label: 'Featured Classified',
    linkText: 'View Listing',
    secondaryText: 'Browse Classifieds',
    secondaryHref: '/classifieds',
  },
  store: {
    gradient: 'from-fuchsia-500 to-fuchsia-700',
    label: 'From the Store',
    linkText: 'Shop Now',
    secondaryText: 'Browse Store',
    secondaryHref: '/store',
  },
} as const;

// ─── Homepage ──────────────────────────────────────────────

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const isPausedRef = useRef(false);
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [trendingArticles, setTrendingArticles] = useState<ArticleCardData[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<EventCardData[]>([]);
  const [weekendPicks, setWeekendPicks] = useState<EventCardData[]>([]);
  const [diningHighlights, setDiningHighlights] = useState<RestaurantCardData[]>([]);
  const [latestVideos, setLatestVideos] = useState<VideoCardData[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionCardData[]>([]);
  const [classifieds, setClassifieds] = useState<ClassifiedItem[]>([]);
  const [diningOffers, setDiningOffers] = useState<DiningOfferItem[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProductItem[]>([]);
  const [curatedHero, setCuratedHero] = useState<ResolvedHomepageItem[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('loading');
    try {
      await apiClient.post('/notifications/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterStatus('success');
      setNewsletterMessage('You\'re subscribed! Check your inbox for a welcome email.');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('Something went wrong. Please try again.');
    }
  }

  useEffect(() => {
    async function fetchHomepageData() {
      // Step 1: Try to fetch curated homepage data
      let curated: CuratedSections | null = null;
      try {
        const { data } = await apiClient.get('/homepage');
        curated = data as CuratedSections;
      } catch {
        // Curated fetch failed — will fall back to individual endpoints for all sections
      }

      // Step 2: Determine which sections need fallback (no curated items)
      const needsTrending = !curated?.trending?.length;
      const needsEvents = !curated?.events?.length;
      const needsWeekend = !curated?.weekend?.length;
      const needsDining = !curated?.dining?.length;
      const needsVideos = !curated?.videos?.length;
      const needsCompetitions = !curated?.competitions?.length;
      const needsClassifieds = !curated?.classifieds?.length;

      // Step 3: Apply curated data for sections that have it
      if (curated?.hero?.length) {
        setCuratedHero(curated.hero);
      }
      if (curated?.trending?.length) {
        setTrendingArticles(curated.trending.map(curatedToArticleCard));
      }
      if (curated?.events?.length) {
        setFeaturedEvents(curated.events.map(curatedToEventCard));
      }
      if (curated?.weekend?.length) {
        setWeekendPicks(curated.weekend.map(curatedToEventCard));
      }
      if (curated?.dining?.length) {
        setDiningHighlights(curated.dining.map(curatedToRestaurantCard));
      }
      if (curated?.videos?.length) {
        setLatestVideos(curated.videos.map(curatedToVideoCard));
      }
      if (curated?.competitions?.length) {
        setCompetitions(curated.competitions.map(curatedToCompetitionCard));
      }
      if (curated?.classifieds?.length) {
        setClassifieds(curated.classifieds.map(curatedToClassifiedItem));
      }

      // Step 4: Fetch fallback data only for sections that need it
      // (plus diningOffers, guides, storeProducts which are always from their own endpoints)
      const fallbackPromises: Promise<unknown>[] = [];
      const fallbackKeys: string[] = [];

      if (needsTrending) {
        fallbackKeys.push('articles');
        fallbackPromises.push(apiClient.get('/articles', { params: { limit: 6, sort: 'date', order: 'desc' } }));
      }
      if (needsEvents) {
        fallbackKeys.push('events');
        fallbackPromises.push(apiClient.get('/events', { params: { limit: 6, status: 'published' } }));
      }
      if (needsWeekend) {
        fallbackKeys.push('weekend');
        fallbackPromises.push(apiClient.get('/events/weekend', { params: { limit: 4 } }));
      }
      if (needsDining) {
        fallbackKeys.push('dining');
        fallbackPromises.push(apiClient.get('/dining/restaurants', { params: { limit: 4, sort: 'rating', order: 'desc' } }));
      }
      if (needsVideos) {
        fallbackKeys.push('videos');
        fallbackPromises.push(apiClient.get('/videos', { params: { limit: 4, status: 'published' } }));
      }
      if (needsCompetitions) {
        fallbackKeys.push('competitions');
        fallbackPromises.push(apiClient.get('/competitions', { params: { limit: 4, status: 'active' } }));
      }
      if (needsClassifieds) {
        fallbackKeys.push('classifieds');
        fallbackPromises.push(apiClient.get('/classifieds', { params: { limit: 6, status: 'active' } }));
      }

      // Always fetch these three — they're not managed by admin curation
      fallbackKeys.push('diningOffers');
      fallbackPromises.push(apiClient.get('/dining/offers', { params: { limit: 3 } }));
      fallbackKeys.push('guides');
      fallbackPromises.push(apiClient.get('/guides', { params: { limit: 4, sort: 'date', order: 'desc' } }));
      fallbackKeys.push('store');
      fallbackPromises.push(apiClient.get('/store/products', { params: { limit: 4, sort: 'created', order: 'desc' } }));

      const fallbackResults = await Promise.allSettled(fallbackPromises);

      // Build a map of key -> result
      const resultMap = new Map<string, PromiseSettledResult<unknown>>();
      fallbackKeys.forEach((key, i) => resultMap.set(key, fallbackResults[i]));

      // Helper to extract image URL from either a string or {url: string} object
      function extractImageUrl(val: unknown): string | null {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null && 'url' in val) return (val as Record<string, unknown>).url as string;
        return null;
      }

      // Helper to extract data array from an axios-style response
      function extractList(key: string): Record<string, unknown>[] | null {
        const r = resultMap.get(key);
        if (r?.status !== 'fulfilled') return null;
        const resp = r.value as { data: Record<string, unknown> | Record<string, unknown>[] };
        const raw = Array.isArray(resp.data) ? resp.data : ((resp.data as Record<string, unknown>)?.data as Record<string, unknown>[] ?? resp.data);
        if (Array.isArray(raw) && raw.length > 0) return raw as Record<string, unknown>[];
        return null;
      }

      // Trending articles fallback
      const articlesList = extractList('articles');
      if (articlesList) {
        const trending = articlesList.slice(0, 6).map((a) => ({
          slug: a.slug as string,
          title: a.title as string,
          excerpt: (a.excerpt || a.summary || '') as string,
          featuredImage: extractImageUrl(a.featured_image ?? a.featuredImage),
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

      // Featured events fallback
      const eventsList = extractList('events');
      if (eventsList) {
        const mapped = eventsList.map((e) => ({
          slug: e.slug as string,
          title: e.title as string,
          excerpt: (e.excerpt || e.description || e.summary || '') as string,
          featuredImage: extractImageUrl(e.featured_image ?? e.featuredImage),
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
        setFeaturedEvents(mapped.slice(0, 6));
      }

      // Weekend picks fallback
      const weekendList = extractList('weekend');
      if (weekendList) {
        const mapped = weekendList.map((e) => ({
          slug: e.slug as string,
          title: e.title as string,
          excerpt: (e.excerpt || e.description || e.summary || '') as string,
          featuredImage: extractImageUrl(e.featured_image ?? e.featuredImage),
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
        setWeekendPicks(mapped);
      }

      // Dining highlights fallback
      const diningList = extractList('dining');
      if (diningList) {
        const mapped: RestaurantCardData[] = diningList.map((r) => {
          const cuisines = r.cuisines as Record<string, unknown>[] | undefined;
          const validPriceRanges = ['budget', 'moderate', 'upscale', 'fine_dining'] as const;
          const rawPrice = (r.price_range || r.priceRange || 'moderate') as string;
          const priceRange = validPriceRanges.includes(rawPrice as typeof validPriceRanges[number])
            ? rawPrice as RestaurantCardData['priceRange']
            : 'moderate';
          return {
            slug: r.slug as string,
            name: (r.name || r.title || '') as string,
            description: (r.description || r.excerpt || '') as string,
            featuredImage: extractImageUrl(r.featured_image ?? r.featuredImage),
            cuisines: Array.isArray(cuisines) ? cuisines.map((c) => String(c.name || c)) : [],
            primaryCuisineSlug: Array.isArray(cuisines) && cuisines.length > 0 ? String(cuisines[0].slug || '') : null,
            district: (r.district || null) as string | null,
            priceRange,
            rating: (r.rating != null ? Number(r.rating) : null),
          };
        });
        setDiningHighlights(mapped);
      }

      // Latest videos fallback
      const videosList = extractList('videos');
      if (videosList) {
        const mapped = videosList.map((v) => ({
          slug: v.slug as string,
          title: v.title as string,
          thumbnailUrl: extractImageUrl(v.thumbnail ?? v.thumbnail_url ?? v.thumbnailUrl),
          seriesName: ((v.series as Record<string, unknown>)?.name || v.series_name || v.seriesName || null) as string | null,
          seriesSlug: ((v.series as Record<string, unknown>)?.slug || v.series_slug || v.seriesSlug || null) as string | null,
          durationSeconds: (v.duration_seconds || v.durationSeconds || v.duration || null) as number | null,
          publishedAt: (v.published_at || v.publishedAt || null) as string | null,
          videoProvider: (v.video_provider || v.videoProvider || 'youtube') as string,
        }));
        setLatestVideos(mapped);
      }

      // Competitions fallback
      const compsList = extractList('competitions');
      if (compsList) {
        const mapped: CompetitionCardData[] = compsList.map((c) => {
          const cat = c.category as Record<string, unknown> | null;
          return {
            slug: c.slug as string,
            title: c.title as string,
            description: (c.description || c.excerpt || '') as string,
            prizeDescription: (c.prize || c.prize_description || c.prizeDescription || null) as string | null,
            featuredImage: extractImageUrl(c.featured_image ?? c.featuredImage),
            endDate: (c.ends_at || c.endsAt || c.end_date || c.endDate || '') as string,
            entryCount: (c.entry_count || c.entryCount || 0) as number,
            status: (c.status || 'active') as string,
            winnerName: (c.winner_name || c.winnerName || null) as string | null,
            categorySlug: cat?.slug ? String(cat.slug) : null,
          };
        });
        setCompetitions(mapped);
      }

      // Classifieds fallback
      const classifiedsList = extractList('classifieds');
      if (classifiedsList) {
        const mapped: ClassifiedItem[] = classifiedsList.map((item) => {
          const cat = item.category as Record<string, unknown> | null;
          return {
            slug: item.slug as string,
            title: item.title as string,
            category: (cat?.name || item.category || '') as string,
            categorySlug: (cat?.slug || item.categorySlug || item.category_slug || 'general') as string,
            price: item.price != null ? Number(item.price) : null,
            priceType: (item.price_type || item.priceType || 'fixed') as string,
            imageUrl: extractImageUrl(item.featured_image ?? item.featuredImage ?? item.image_url ?? item.imageUrl),
            location: (item.location || item.district || null) as string | null,
            condition: (item.condition || null) as string | null,
            featured: (item.featured || item.is_featured || false) as boolean,
          };
        });
        setClassifieds(mapped);
      }

      // Dining offers (always from endpoint)
      const offersList = extractList('diningOffers');
      if (offersList) {
        const mapped: DiningOfferItem[] = offersList.map((o) => {
          const rest = o.restaurant as Record<string, unknown> | undefined;
          const cuisines = rest?.cuisines as Record<string, unknown>[] | undefined;
          return {
            id: String(o.id || o.slug || ''),
            title: (o.title || o.name || '') as string,
            description: (o.description || '') as string,
            endDate: (o.end_date || o.endDate || o.ends_at || o.endsAt || '') as string,
            restaurant: {
              slug: (rest?.slug || '') as string,
              name: (rest?.name || '') as string,
              featuredImage: extractImageUrl(rest?.featured_image ?? rest?.featuredImage),
              primaryCuisineSlug: Array.isArray(cuisines) && cuisines.length > 0 ? String(cuisines[0].slug || '') : null,
              district: (rest?.district || '') as string,
            },
          };
        });
        setDiningOffers(mapped);
      }

      // Guides (always from endpoint)
      const guidesList = extractList('guides');
      if (guidesList) {
        const mapped: GuideItem[] = guidesList.map((g) => {
          const topic = g.topic as Record<string, unknown> | null;
          const author = g.author as Record<string, unknown> | null;
          return {
            slug: g.slug as string,
            title: g.title as string,
            excerpt: (g.excerpt || g.description || g.summary || '') as string,
            author: (author?.name || author?.username || g.author_name || 'I♥Berlin Team') as string,
            topicSlug: (topic?.slug || g.topic_slug || g.topicSlug || '') as string,
            lastReviewed: (g.last_reviewed || g.lastReviewed || g.updated_at || g.updatedAt || '') as string,
          };
        });
        setGuides(mapped);
      }

      // Store products (always from endpoint)
      const productsList = extractList('store');
      if (productsList) {
        const mapped: StoreProductItem[] = productsList.map((p) => {
          const cat = p.category as Record<string, unknown> | null;
          return {
            slug: p.slug as string,
            name: (p.name || p.title || '') as string,
            shortDescription: (p.short_description || p.shortDescription || p.description || '') as string,
            basePrice: Number(p.base_price || p.basePrice || p.price || 0),
            compareAtPrice: p.compare_at_price != null ? Number(p.compare_at_price) : (p.compareAtPrice != null ? Number(p.compareAtPrice) : null),
            imageUrl: extractImageUrl(p.image_url ?? p.imageUrl ?? p.featured_image ?? p.featuredImage),
            category: (cat?.name || p.category_name || '') as string,
            categorySlug: (cat?.slug || p.category_slug || p.categorySlug || '') as string,
            isFeatured: (p.is_featured || p.isFeatured || false) as boolean,
          };
        });
        setStoreProducts(mapped);
      }
    }

    fetchHomepageData().finally(() => setIsLoading(false));
  }, []);

  // ─── Hero Slides ──────────────────────────────────────────
  const heroSlides: HeroSlide[] = [];

  // If curated hero items exist, use them; otherwise fall back to first item from each section
  if (curatedHero.length > 0) {
    for (const item of curatedHero) {
      const slide = curatedItemToHeroSlide(item);
      if (slide) heroSlides.push(slide);
    }
  } else {
    // Fallback: build hero from first item of each data section
    if (trendingArticles.length > 0) {
      const a = trendingArticles[0];
      const cfg = HERO_SLIDE_CONFIG.news;
      heroSlides.push({
        key: 'news',
        label: cfg.label,
        title: a.title,
        excerpt: a.excerpt,
        imageUrl: a.featuredImage,
        linkHref: buildArticleUrl(a.slug, a.categorySlug),
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: a.category || 'News',
      });
    }

    if (featuredEvents.length > 0) {
      const e = featuredEvents[0];
      const cfg = HERO_SLIDE_CONFIG.events;
      heroSlides.push({
        key: 'events',
        label: cfg.label,
        title: e.title,
        excerpt: e.excerpt || '',
        imageUrl: e.featuredImage,
        linkHref: buildEventUrl(e.slug, e.categorySlug),
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: e.category || 'Events',
      });
    }

    if (diningHighlights.length > 0) {
      const d = diningHighlights[0];
      const cfg = HERO_SLIDE_CONFIG.dining;
      heroSlides.push({
        key: 'dining',
        label: cfg.label,
        title: d.name,
        excerpt: d.description,
        imageUrl: d.featuredImage,
        linkHref: buildRestaurantUrl(d.slug, d.primaryCuisineSlug),
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: d.cuisines[0] || 'Dining',
      });
    }

    if (guides.length > 0) {
      const g = guides[0];
      const cfg = HERO_SLIDE_CONFIG.guide;
      heroSlides.push({
        key: 'guide',
        label: cfg.label,
        title: g.title,
        excerpt: g.excerpt,
        imageUrl: null,
        linkHref: buildGuideUrl(g.slug, g.topicSlug),
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: 'Guide',
      });
    }

    if (latestVideos.length > 0) {
      const v = latestVideos[0];
      const cfg = HERO_SLIDE_CONFIG.videos;
      heroSlides.push({
        key: 'videos',
        label: cfg.label,
        title: v.title,
        excerpt: v.seriesName ? `From the series: ${v.seriesName}` : 'Watch the latest Berlin video',
        imageUrl: v.thumbnailUrl,
        linkHref: buildVideoUrl(v.slug, v.seriesSlug),
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: v.seriesName || 'Video',
      });
    }

    if (competitions.length > 0) {
      const c = competitions[0];
      const cfg = HERO_SLIDE_CONFIG.competitions;
      heroSlides.push({
        key: 'competitions',
        label: cfg.label,
        title: c.title,
        excerpt: c.description,
        imageUrl: c.featuredImage,
        linkHref: buildCompetitionUrl(c.slug, c.categorySlug),
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: 'Competition',
      });
    }

    if (classifieds.length > 0) {
      const cl = classifieds.find(c => c.featured) || classifieds[0];
      const cfg = HERO_SLIDE_CONFIG.classifieds;
      heroSlides.push({
        key: 'classifieds',
        label: cfg.label,
        title: cl.title,
        excerpt: cl.location ? `Located in ${cl.location}` : cl.category,
        imageUrl: cl.imageUrl,
        linkHref: `/classifieds/${cl.categorySlug}/${cl.slug}`,
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: cl.category || 'Classified',
      });
    }

    if (storeProducts.length > 0) {
      const p = storeProducts[0];
      const cfg = HERO_SLIDE_CONFIG.store;
      heroSlides.push({
        key: 'store',
        label: cfg.label,
        title: p.name,
        excerpt: p.shortDescription,
        imageUrl: p.imageUrl,
        linkHref: `/store/${p.categorySlug}/${p.slug}`,
        linkText: cfg.linkText,
        secondaryHref: cfg.secondaryHref,
        secondaryText: cfg.secondaryText,
        gradient: cfg.gradient,
        categoryTag: p.category || 'Store',
      });
    }
  }

  // ─── Carousel Navigation ────────────────────────────────
  const goToSlide = useCallback((index: number) => {
    setActiveSlide(index);
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }
    if (heroSlides.length > 1) {
      slideIntervalRef.current = setInterval(() => {
        if (isPausedRef.current || document.hidden) return;
        setActiveSlide(prev => (prev + 1) % heroSlides.length);
      }, 6000);
    }
  }, [heroSlides.length]);

  const goNext = useCallback(() => {
    goToSlide((activeSlide + 1) % heroSlides.length);
  }, [activeSlide, heroSlides.length, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [activeSlide, heroSlides.length, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (isLoading || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      if (isPausedRef.current || document.hidden) return;
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    slideIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isLoading, heroSlides.length]);

  // ─── JSON-LD Structured Data ────────────────────────────────

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'I♥Berlin',
        url: 'https://iloveberlin.biz',
        logo: 'https://iloveberlin.biz/logo.png',
        sameAs: [
          'https://www.facebook.com/iloveberlin',
          'https://www.instagram.com/iloveberlin',
          'https://twitter.com/iloveberlin',
        ],
      },
      {
        '@type': 'WebSite',
        name: 'I♥Berlin',
        url: 'https://iloveberlin.biz',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://iloveberlin.biz/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      ...(trendingArticles.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: 'Trending in Berlin',
              itemListElement: trendingArticles.map((article, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://iloveberlin.biz${buildArticleUrl(article.slug, article.categorySlug)}`,
                name: article.title,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div>
      {/* Hero Carousel */}
      <section
        className="relative overflow-hidden text-white"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured content carousel"
        tabIndex={0}
        onMouseEnter={() => { isPausedRef.current = true; }}
        onMouseLeave={() => { isPausedRef.current = false; }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
        }}
      >
        {isLoading ? (
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 py-10 md:py-14">
            <div className="container mx-auto px-4">
              <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="h-6 bg-white/20 rounded-full w-32 mb-4" />
                  <div className="h-12 bg-white/20 rounded w-3/4 mb-4" />
                  <div className="h-6 bg-white/10 rounded w-full mb-6" />
                  <div className="flex gap-4">
                    <div className="h-12 bg-white/20 rounded-lg w-32" />
                    <div className="h-12 bg-white/10 rounded-lg w-36" />
                  </div>
                </div>
                <div className="aspect-[4/3] bg-white/10 rounded-xl" />
              </div>
            </div>
          </div>
        ) : heroSlides.length > 0 ? (
          <>
            <div className="relative">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.key}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${heroSlides.length}: ${slide.label}`}
                  aria-hidden={index !== activeSlide}
                  className={`${index === 0 ? 'relative' : 'absolute inset-0'} transition-opacity duration-700 ${
                    index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
                  <div className="relative py-10 md:py-14">
                    <div className="container mx-auto px-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        <div>
                          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                            {slide.label}
                          </span>
                          <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            {slide.title}
                          </h1>
                          <p className="text-base text-white/80 mb-4 max-w-xl line-clamp-2">
                            {slide.excerpt}
                          </p>
                          <div className="flex items-center gap-4 flex-wrap">
                            <Link
                              href={slide.linkHref}
                              tabIndex={index === activeSlide ? 0 : -1}
                              className="px-5 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm"
                            >
                              {slide.linkText}
                            </Link>
                            <Link
                              href={slide.secondaryHref}
                              tabIndex={index === activeSlide ? 0 : -1}
                              className="px-5 py-2.5 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30 text-sm"
                            >
                              {slide.secondaryText}
                            </Link>
                          </div>
                        </div>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/10">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-24 h-24 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <span className="absolute top-4 left-4 px-3 py-1 bg-black/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                            {slide.categoryTag}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev/Next Arrows */}
            {heroSlides.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors text-white"
                  aria-label="Previous slide"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors text-white"
                  aria-label="Next slide"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.key}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeSlide
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${index + 1}: ${slide.label}`}
                      aria-current={index === activeSlide ? 'true' : undefined}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-black/10">
                  <div
                    key={`progress-${activeSlide}`}
                    className="h-full bg-white/60"
                    style={{ animation: 'heroProgress 6s linear' }}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 py-10 md:py-14">
            <div className="container mx-auto px-4 text-center py-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to I♥Berlin</h1>
              <p className="text-base text-white/80 mb-4 max-w-xl mx-auto">
                Your digital guide to Berlin life — news, events, dining, guides, and more.
              </p>
              <Link
                href="/news"
                className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Explore Content
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:scale-[1.02] hover:shadow-primary-glow transition-all duration-300 text-center group"
            >
              <div className="text-gray-400 group-hover:text-primary-600 transition-colors mb-2">
                {section.icon}
              </div>
              <h2 className="text-sm font-semibold text-gray-900 mb-0.5">
                {section.title}
              </h2>
              <p className="text-[11px] text-gray-500 hidden md:block">{section.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending in Berlin */}
      {trendingArticles.length > 0 && (
        <section className="bg-primary-50/40 py-6">
          <div className="container mx-auto px-4">
            <SectionHeader title="Trending in Berlin" href="/news" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ad Banner */}
      <section className="container mx-auto px-4 py-4">
        <AdBanner position="homepage_banner" />
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <SectionHeader title="Featured Events" href="/events" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredEvents.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* This Weekend in Berlin */}
      {weekendPicks.length > 0 && (
        <section className="bg-primary-50/40 py-6">
          <div className="container mx-auto px-4">
            <SectionHeader title="This Weekend in Berlin" href="/events" linkText="See all weekend events" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weekendPicks.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dining Highlights */}
      {diningHighlights.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <SectionHeader title="Dining Highlights" href="/dining" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {diningHighlights.map((restaurant) => (
              <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
            ))}
          </div>
        </section>
      )}

      {/* Dining Deals */}
      {diningOffers.length > 0 && (
        <section className="bg-primary-50/40 py-6">
          <div className="container mx-auto px-4">
            <SectionHeader title="Dining Deals" href="/dining/offers" linkText="See all deals" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {diningOffers.map((offer) => (
                <Link
                  key={offer.id}
                  href={buildRestaurantUrl(offer.restaurant.slug, offer.restaurant.primaryCuisineSlug)}
                  className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    {offer.restaurant.featuredImage ? (
                      <img
                        src={offer.restaurant.featuredImage}
                        alt={offer.restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                        <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Deal
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{offer.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{offer.restaurant.name}</span>
                      {offer.endDate && <span>Ends {formatDate(offer.endDate)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Essential Berlin Guides */}
      {guides.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <SectionHeader title="Essential Berlin Guides" href="/guide" linkText="Browse all guides" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={buildGuideUrl(guide.slug, guide.topicSlug)}
                className="group block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-primary-glow hover:border-primary-200 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-xs text-primary-600 font-medium">Guide</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{guide.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>By {guide.author}</span>
                  {guide.lastReviewed && <span>Reviewed {formatDate(guide.lastReviewed)}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Videos */}
      {latestVideos.length > 0 && (
        <section className="bg-primary-50/40 py-6">
          <div className="container mx-auto px-4">
            <SectionHeader title="Latest Videos" href="/videos" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestVideos.map((video) => (
                <VideoCard key={video.slug} video={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Stay in the Loop</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Get the best of Berlin delivered to your inbox — events, deals, guides, and more.
          </p>
          {newsletterStatus === 'success' ? (
            <p className="text-green-200 font-medium">{newsletterMessage}</p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors disabled:opacity-60"
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          {newsletterStatus === 'error' && (
            <p className="text-red-200 text-sm mt-3">{newsletterMessage}</p>
          )}
        </div>
      </section>

      {/* Win Amazing Prizes (Competitions) */}
      {competitions.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <SectionHeader title="Win Amazing Prizes" href="/competitions" linkText="See all competitions" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {competitions.map((comp) => (
              <CompetitionCard key={comp.slug} competition={comp} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Classifieds */}
      {classifieds.length > 0 && (
        <section className="bg-primary-50/40 py-6">
          <div className="container mx-auto px-4">
            <SectionHeader title="Featured Classifieds" href="/classifieds" linkText="Browse all classifieds" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classifieds.map((item) => (
                <Link
                  key={item.slug}
                  href={`/classifieds/${item.categorySlug}/${item.slug}`}
                  className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:border-primary-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-gray-800/80 text-white text-xs font-semibold rounded-full">
                      {item.category}
                    </span>
                    {item.featured && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {formatClassifiedPrice(item.price, item.priceType)}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {formatCondition(item.condition) && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                            {formatCondition(item.condition)}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.location}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Berlin Store */}
      {storeProducts.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <SectionHeader title="Berlin Store" href="/store" linkText="Shop all products" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {storeProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/store/${product.categorySlug}/${product.slug}`}
                className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                      <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  )}
                  {product.compareAtPrice != null && product.compareAtPrice > product.basePrice && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      Sale
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600">
                      €{product.basePrice.toFixed(2)}
                    </span>
                    {product.compareAtPrice != null && product.compareAtPrice > product.basePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        €{product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Carousel Progress Animation */}
      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
