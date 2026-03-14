import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toCategorySeoSlug } from '@/lib/news-seo-utils';
import { LatestArticleList } from './latest-article-list';
import type { ArticleCardData } from '@/components/articles/article-card';

export const metadata: Metadata = {
  title: 'Berlin News',
  description:
    'Stay informed with the latest stories, events, and happenings from Germany\'s vibrant capital.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCategories(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/categories/tree?type=article`, {
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
    console.error('Failed to load news categories:', err);
  }
  return [];
}

async function getLatestArticles(): Promise<{ articles: ArticleCardData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/articles?limit=6&sort=date&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const articles = (items as Record<string, unknown>[]).map((a) => {
        const cat = a.category as Record<string, unknown> | null;
        const author = a.author as Record<string, unknown> | null;
        const featuredImage =
          typeof a.featured_image === 'object' && a.featured_image
            ? ((a.featured_image as Record<string, unknown>).url as string)
            : (a.featured_image as string | null) ?? null;

        return {
          slug: String(a.slug || ''),
          title: String(a.title || ''),
          excerpt: String(a.excerpt || ''),
          featuredImage,
          category: String(cat?.name || ''),
          categorySlug: String(cat?.slug || ''),
          author: {
            name: String(author?.display_name || author?.name || author?.username || 'Staff Writer'),
            avatarUrl: (author?.avatar_url ?? null) as string | null,
          },
          publishedAt: String(a.published_at || a.created_at || ''),
          readTime: Number(a.read_time_minutes || 4),
        };
      });
      return { articles, total };
    }
  } catch (err) {
    console.error('Failed to load latest articles:', err);
  }
  return { articles: [], total: 0 };
}

export default async function NewsPage() {
  const [categories, { articles: latestArticles, total: latestTotal }] = await Promise.all([
    getCategories(),
    getLatestArticles(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Berlin News
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed with the latest stories, events, and happenings from
          Germany&apos;s vibrant capital.
        </p>
      </section>

      {/* Category Grid */}
      <section>
        <CategoryGrid
          categories={categories}
          basePath="/news"
          slugTransform={toCategorySeoSlug}
          emptyMessage="No news categories available yet. Check back soon!"
        />
      </section>

      {/* Latest News */}
      <LatestArticleList initialArticles={latestArticles} initialTotal={latestTotal} />
    </div>
  );
}
