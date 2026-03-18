import type { Metadata } from 'next';
import Link from 'next/link';
import type { CompetitionCardData } from '@/components/competitions/competition-card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ArchiveGrid } from './archive-grid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiCompetition {
  slug: string;
  title: string;
  description: string;
  prize_description: string | null;
  featured_image: { url: string } | null;
  end_date: string;
  entry_count: number;
  status: string;
  winner: { display_name: string } | null;
}

function mapApiCompetition(c: ApiCompetition): CompetitionCardData {
  return {
    slug: c.slug,
    title: c.title,
    description: c.description,
    prizeDescription: c.prize_description,
    featuredImage: c.featured_image?.url || null,
    endDate: c.end_date,
    entryCount: c.entry_count || 0,
    status: c.status,
    winnerName: c.winner?.display_name || null,
  };
}

async function getArchivedCompetitions(): Promise<CompetitionCardData[]> {
  try {
    const res = await fetch(`${API_URL}/competitions/archive?limit=50`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const result = await res.json();
      return (result.data || []).map(mapApiCompetition);
    }
  } catch {
    // Network error
  }
  return [];
}

export const metadata: Metadata = {
  title: 'Past Competitions - ILOVEBERLIN',
  description:
    'Browse our previous competitions and their winners. See what amazing prizes have been won in Berlin.',
  openGraph: {
    title: 'Past Competitions - ILOVEBERLIN',
    description:
      'Browse our previous competitions and their winners.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Past Competitions - ILOVEBERLIN',
  },
  alternates: {
    canonical: 'https://iloveberlin.biz/competitions/archive',
  },
};

export default async function CompetitionsArchivePage() {
  const competitions = await getArchivedCompetitions();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            { label: 'Archive' },
          ]}
        />
      </div>

      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Past Competitions
            </h1>
            <p className="text-gray-600">
              Browse our previous competitions and their winners.
            </p>
          </div>
          <Link
            href="/competitions"
            className="hidden md:inline-flex px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            View Active Competitions
          </Link>
        </div>
        <Link
          href="/competitions"
          className="md:hidden inline-flex mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          &larr; View Active Competitions
        </Link>
      </section>

      {/* Past Competitions Grid */}
      <section>
        <ArchiveGrid competitions={competitions} />
      </section>
    </div>
  );
}
