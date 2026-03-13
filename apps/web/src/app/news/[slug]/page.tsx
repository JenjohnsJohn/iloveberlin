import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleContent } from './article-content';

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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found' };

  const publishedDate = article.published_at ? new Date(article.published_at).toISOString() : undefined;

  return {
    title: article.title,
    description: article.excerpt || article.subtitle || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.subtitle || undefined,
      type: 'article',
      publishedTime: publishedDate,
      authors: [article.author.display_name],
      images: article.featured_image ? [article.featured_image.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.subtitle || undefined,
    },
    alternates: {
      canonical: `https://iloveberlin.biz/news/${article.slug}`,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.subtitle,
    image: article.featured_image?.url,
    datePublished: article.published_at,
    author: {
      '@type': 'Person',
      name: article.author.display_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ILoveBerlin',
      url: 'https://iloveberlin.biz',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://iloveberlin.biz/news/${article.slug}`,
    },
    wordCount: article.body.trim().split(/\s+/).length,
    articleSection: article.category?.name,
    keywords: article.tags.map((t) => t.name).join(', '),
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
          categorySlug: article.category?.slug || 'general',
          author: {
            name: article.author.display_name,
            avatarUrl: article.author.avatar_url,
            bio: article.author.bio,
          },
          publishedAt: publishedDate,
          readTime: article.read_time_minutes,
          tags: article.tags.map((t) => t.name),
        }}
      />
    </>
  );
}
