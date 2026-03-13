import type { Metadata } from 'next';
import { CategoryArticleList } from './category-article-list';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCategoryName(slug: string): Promise<string> {
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
  // Fallback: convert slug to title case
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = await getCategoryName(slug);

  return {
    title: `${categoryName} News - ILoveBerlin`,
    description: `The latest ${categoryName.toLowerCase()} news and stories from Berlin.`,
    openGraph: {
      title: `${categoryName} News - ILoveBerlin`,
      description: `The latest ${categoryName.toLowerCase()} news and stories from Berlin.`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = await getCategoryName(slug);

  return <CategoryArticleList categorySlug={slug} categoryName={categoryName} />;
}
