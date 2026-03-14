import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { CategoryArticleList } from './category-article-list';
import { fromCategorySeoSlug, buildArticleUrl } from '@/lib/news-seo-utils';

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

async function getArticleBySlug(slug: string): Promise<{ slug: string; category?: { slug: string } } | null> {
  try {
    const res = await fetch(`${API_URL}/articles/${slug}`, {
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
  const rawSlug = fromCategorySeoSlug(category);

  if (!rawSlug) {
    // Might be a legacy article slug — metadata will be handled by redirect or 404
    return { title: 'Redirecting...' };
  }

  const categoryName = await getCategoryName(rawSlug);
  if (!categoryName) return { title: 'Category Not Found' };

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
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const rawSlug = fromCategorySeoSlug(category);

  if (rawSlug) {
    // Valid SEO slug like "berlin-culture-news" → raw slug "culture"
    const categoryName = await getCategoryName(rawSlug);
    if (categoryName) {
      return <CategoryArticleList categorySlug={rawSlug} categoryName={categoryName} />;
    }
    // Category not found in API — might still be a valid slug, try title-case fallback
    const fallbackName = rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <CategoryArticleList categorySlug={rawSlug} categoryName={fallbackName} />;
  }

  // Not a valid SEO slug — check if it's a legacy article slug
  const article = await getArticleBySlug(category);
  if (article) {
    const categorySlug = article.category?.slug || null;
    permanentRedirect(buildArticleUrl(article.slug, categorySlug));
  }

  notFound();
}
