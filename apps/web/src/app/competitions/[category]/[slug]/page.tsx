import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { CompetitionContent } from './competition-content';
import type { CompetitionDetail } from './competition-content';
import { buildCompetitionUrl, toCompetitionCategorySeoSlug } from '@/lib/competitions-seo-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiCompetition {
  id: string;
  slug: string;
  title: string;
  description: string;
  prize_description: string | null;
  featured_image: { url: string } | null;
  start_date: string;
  end_date: string;
  status: string;
  terms_conditions: string | null;
  entry_count: number;
  max_entries: number | null;
  winner: { display_name: string } | null;
  category?: { name: string; slug: string } | null;
}

function mapApiCompetition(c: ApiCompetition): CompetitionDetail {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    prizeDescription: c.prize_description,
    featuredImage: c.featured_image?.url || null,
    startDate: c.start_date,
    endDate: c.end_date,
    status: c.status,
    termsConditions: c.terms_conditions,
    entryCount: c.entry_count || 0,
    maxEntries: c.max_entries,
    winnerName: c.winner?.display_name || null,
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function getCompetition(slug: string): Promise<ApiCompetition | null> {
  try {
    const res = await fetch(`${API_URL}/competitions/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
  } catch {
    // Network error
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const raw = await getCompetition(slug);
  if (!raw) return { title: 'Competition Not Found' };

  const competition = mapApiCompetition(raw);
  const plainDesc = stripHtml(competition.description).slice(0, 160);
  const categorySlug = raw.category?.slug || null;

  return {
    title: `${competition.title} - ILoveBerlin Competition`,
    description: plainDesc,
    openGraph: {
      title: competition.title,
      description: plainDesc,
      type: 'website',
      ...(competition.featuredImage && {
        images: [{ url: competition.featuredImage }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: competition.title,
      description: plainDesc,
    },
    alternates: {
      canonical: `https://iloveberlin.biz${buildCompetitionUrl(slug, categorySlug)}`,
    },
  };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const raw = await getCompetition(slug);

  if (!raw) {
    notFound();
  }

  // Validate category segment
  const actualCategorySlug = raw.category?.slug || null;
  const expectedCategorySegment = toCompetitionCategorySeoSlug(actualCategorySlug || 'general');
  if (category !== expectedCategorySegment) {
    permanentRedirect(buildCompetitionUrl(slug, actualCategorySlug));
  }

  const competition = mapApiCompetition(raw);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: competition.title,
    description: stripHtml(competition.description).slice(0, 300),
    startDate: competition.startDate,
    endDate: competition.endDate,
    eventStatus:
      competition.status === 'active'
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventCancelled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `https://iloveberlin.biz${buildCompetitionUrl(competition.slug, actualCategorySlug)}`,
    },
    organizer: {
      '@type': 'Organization',
      name: 'ILoveBerlin',
      url: 'https://iloveberlin.biz',
    },
    ...(competition.featuredImage && {
      image: competition.featuredImage,
    }),
    ...(competition.prizeDescription && {
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        description: competition.prizeDescription,
        availability: competition.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompetitionContent competition={competition} />
    </>
  );
}
