import type { Metadata } from 'next';
import Link from 'next/link';
import type { CompetitionCardData } from '@/components/competitions/competition-card';
import { CompetitionsGrid } from './competitions-grid';

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

async function getActiveCompetitions(): Promise<CompetitionCardData[]> {
  try {
    const res = await fetch(`${API_URL}/competitions?limit=50`, {
      next: { revalidate: 60 },
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
    canonical: 'https://iloveberlin.biz/competitions',
  },
};

export default async function CompetitionsPage() {
  const competitions = await getActiveCompetitions();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
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
              d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.985 6.985 0 01-4.27 1.472 6.985 6.985 0 01-4.27-1.472"
            />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Win Amazing Prizes
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter our competitions for a chance to win incredible experiences and
          prizes in Berlin. New competitions added regularly!
        </p>
      </section>

      {/* Active Competitions Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Active Competitions
          </h2>
          <Link
            href="/competitions/archive"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View Past Competitions &rarr;
          </Link>
        </div>

        <CompetitionsGrid competitions={competitions} />
      </section>
    </div>
  );
}
