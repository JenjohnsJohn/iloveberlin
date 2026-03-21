import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toCompetitionCategorySeoSlug } from '@/lib/competitions-seo-utils';
import { LatestCompetitionList } from './latest-competition-list';
import type { CompetitionCardData } from '@/components/competitions/competition-card';
import { API_URL, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Competitions - Win Amazing Prizes in Berlin',
  description:
    'Enter our competitions for a chance to win incredible experiences and prizes in Berlin. New competitions added regularly!',
  openGraph: {
    title: 'Competitions - Win Amazing Prizes in Berlin',
    description:
      'Enter our competitions for a chance to win incredible experiences and prizes in Berlin.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Competitions - Win Amazing Prizes in Berlin',
  },
  alternates: {
    canonical: `${SITE_URL}/competitions`,
  },
};

async function getCategories(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=competition`, {
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
    console.error('Failed to load competition categories:', err);
  }
  return [];
}

async function getLatestCompetitions(): Promise<{ competitions: CompetitionCardData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/competitions?limit=6&sort=date&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const competitions = (items as Record<string, unknown>[]).map((c) => {
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
      });
      return { competitions, total };
    }
  } catch (err) {
    console.error('Failed to load latest competitions:', err);
  }
  return { competitions: [], total: 0 };
}

export default async function CompetitionsPage() {
  const [categories, { competitions: latestCompetitions, total: competitionsTotal }] = await Promise.all([
    getCategories(),
    getLatestCompetitions(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="img"
            aria-label="Trophy icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.985 6.985 0 01-4.27 1.472 6.985 6.985 0 01-4.27-1.472"
            />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Win Amazing Prizes
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Enter our competitions for a chance to win incredible experiences and
          prizes in Berlin. New competitions added regularly!
        </p>
        <div className="mt-4">
          <Link
            href="/competitions/archive"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View Past Competitions &rarr;
          </Link>
        </div>
      </section>

      {/* Category Grid */}
      <section>
        <CategoryGrid
          categories={categories}
          basePath="/competitions"
          slugTransform={toCompetitionCategorySeoSlug}
          emptyMessage="No competition categories available yet. Check back soon!"
        />
      </section>

      <LatestCompetitionList initialCompetitions={latestCompetitions} initialTotal={competitionsTotal} />
    </div>
  );
}
