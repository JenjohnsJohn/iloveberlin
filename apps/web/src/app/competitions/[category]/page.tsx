import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { CompetitionCategoryContent } from './competition-category-content';
import { fromCompetitionCategorySeoSlug, buildCompetitionUrl } from '@/lib/competitions-seo-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCategoryName(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/categories/slug/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) return data.name;
    }
  } catch {
    // API error
  }
  return null;
}

async function getCompetitionBySlug(slug: string): Promise<{ slug: string; category?: { slug: string } } | null> {
  try {
    const res = await fetch(`${API_URL}/competitions/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
  } catch {
    // API error
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const rawSlug = fromCompetitionCategorySeoSlug(category);

  if (!rawSlug) {
    return { title: 'Redirecting...' };
  }

  const categoryName = await getCategoryName(rawSlug);
  if (!categoryName) return { title: 'Category Not Found' };

  return {
    title: `${categoryName} Competitions - ILoveBerlin`,
    description: `Enter ${categoryName.toLowerCase()} competitions for a chance to win amazing prizes in Berlin.`,
    openGraph: {
      title: `${categoryName} Competitions - ILoveBerlin`,
      description: `Enter ${categoryName.toLowerCase()} competitions for a chance to win amazing prizes in Berlin.`,
    },
  };
}

export default async function CompetitionCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const rawSlug = fromCompetitionCategorySeoSlug(category);

  if (rawSlug) {
    const categoryName = await getCategoryName(rawSlug);
    if (categoryName) {
      return <CompetitionCategoryContent categorySlug={rawSlug} categoryName={categoryName} />;
    }
    const fallbackName = rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <CompetitionCategoryContent categorySlug={rawSlug} categoryName={fallbackName} />;
  }

  // Not a valid SEO slug — check if it's a legacy competition slug
  // Note: "archive" is handled by the /competitions/archive/ route which takes precedence
  const competition = await getCompetitionBySlug(category);
  if (competition) {
    const categorySlug = competition.category?.slug || null;
    permanentRedirect(buildCompetitionUrl(competition.slug, categorySlug));
  }

  notFound();
}
