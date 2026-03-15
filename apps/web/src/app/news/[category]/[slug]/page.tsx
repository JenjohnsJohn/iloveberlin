import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArticleContent } from './article-content';
import { buildArticleUrl, fromCategorySeoSlug, toCategorySeoSlug } from '@/lib/news-seo-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string;
  featured_image: { url: string } | null;
  category: { name: string; slug: string } | null;
  author: { id: string; display_name: string; avatar_url: string | null; bio: string | null };
  tags: { name: string; slug: string }[];
  published_at: string | null;
  read_time_minutes: number;
  view_count: number;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  source_url?: string | null;
  source_name?: string | null;
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/articles/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found' };

  const metaTitle = article.seo_title || article.title;
  const metaDescription = article.seo_description || article.excerpt || article.subtitle || undefined;
  const publishedDate = article.published_at ? new Date(article.published_at).toISOString() : undefined;
  const categorySlug = article.category?.slug || null;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: article.seo_keywords || undefined,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      publishedTime: publishedDate,
      authors: [article.author.display_name],
      images: article.featured_image ? [article.featured_image.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    },
    alternates: {
      canonical: `https://iloveberlin.biz${buildArticleUrl(slug, categorySlug)}`,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // Validate category segment matches article's actual category
  const actualCategorySlug = article.category?.slug || null;
  const expectedCategorySegment = toCategorySeoSlug(actualCategorySlug || 'general');
  if (category !== expectedCategorySegment) {
    permanentRedirect(buildArticleUrl(slug, actualCategorySlug));
  }

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const categorySlug = article.category?.slug || 'general';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || article.subtitle,
    image: article.featured_image?.url,
    datePublished: article.published_at,
    author: {
      '@type': 'Person',
      name: article.author.display_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'I♥Berlin',
      url: 'https://iloveberlin.biz',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://iloveberlin.biz${buildArticleUrl(slug, categorySlug)}`,
    },
    wordCount: article.body.trim().split(/\s+/).length,
    articleSection: article.category?.name,
    keywords: article.seo_keywords || article.tags.map((t) => t.name).join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleContent
        article={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          subtitle: article.subtitle,
          body: article.body,
          featuredImage: article.featured_image?.url || null,
          category: article.category?.name || 'General',
          categorySlug,
          author: {
            name: article.author.display_name,
            avatarUrl: article.author.avatar_url,
            bio: article.author.bio,
          },
          publishedAt: publishedDate,
          readTime: article.read_time_minutes,
          tags: article.tags.map((t) => t.name),
          sourceUrl: article.source_url || null,
          sourceName: article.source_name || null,
        }}
      />
    </>
  );
}
