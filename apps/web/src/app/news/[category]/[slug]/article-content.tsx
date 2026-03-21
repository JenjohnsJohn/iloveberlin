'use client';

import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { SocialShare } from '@/components/articles/social-share';
import { ArticleCard } from '@/components/articles/article-card';
import type { ArticleCardData } from '@/components/articles/article-card';
import { sanitizeHtml } from '@/lib/sanitize';
import apiClient from '@/lib/api-client';
import { buildArticleUrl, buildCategoryUrl } from '@/lib/news-seo-utils';
import { SITE_URL } from '@/lib/constants';

interface ArticleContentProps {
  article: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    body: string;
    featuredImage: string | null;
    category: string;
    categorySlug: string;
    author: {
      name: string;
      avatarUrl: string | null;
      bio: string | null;
    };
    publishedAt: string;
    readTime: number;
    tags: string[];
    sourceUrl: string | null;
    sourceName: string | null;
  };
}

export function ArticleContent({ article }: ArticleContentProps) {
  const [relatedArticles, setRelatedArticles] = useState<ArticleCardData[]>([]);

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${SITE_URL}${buildArticleUrl(article.slug, article.categorySlug)}`;

  // Track page view on mount
  useEffect(() => {
    apiClient.post(`/articles/${article.slug}/view`).catch(() => {
      // Silently ignore view tracking errors
    });
  }, [article.slug]);

  // Fetch related articles from same category
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const { data } = await apiClient.get('/articles', {
          params: { category: article.categorySlug, limit: 3 },
        });
        const items = data.data ?? data;
        if (!Array.isArray(items)) return;
        setRelatedArticles(
          items
            .filter((a: Record<string, unknown>) => a.slug !== article.slug)
            .slice(0, 3)
            .map((a: Record<string, unknown>) => {
              const cat = a.category as Record<string, unknown> | null;
              const author = a.author as Record<string, unknown> | null;
              return {
                slug: String(a.slug || ''),
                title: String(a.title || ''),
                excerpt: String(a.excerpt || ''),
                featuredImage: ((a.featured_image as Record<string, unknown>)?.url || a.featured_image || a.featuredImage || null) as string | null,
                category: String(cat?.name || ''),
                categorySlug: String(cat?.slug || ''),
                author: {
                  name: String(author?.display_name || author?.name || author?.username || 'Staff Writer'),
                  avatarUrl: (author?.avatar_url ?? author?.avatarUrl ?? null) as string | null,
                },
                publishedAt: String(a.published_at || a.publishedAt || a.created_at || ''),
                readTime: Number(a.read_time_minutes || a.read_time || 4),
              };
            })
        );
      } catch {
        // Silently ignore - related articles are non-critical
      }
    };
    if (article.categorySlug) fetchRelated();
  }, [article.categorySlug, article.slug]);

  return (
    <div>
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-primary-100 to-primary-300">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="py-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'News', href: '/news' },
              { label: article.category, href: buildCategoryUrl(article.categorySlug) },
              { label: article.title },
            ]}
          />
        </div>

        {/* Article Header */}
        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            {/* Category Badge */}
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              {article.category}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-xl text-gray-600 mb-6">{article.subtitle}</p>
            )}

            {/* Author Info + Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden">
                  {article.author.avatarUrl ? (
                    <img
                      src={article.author.avatarUrl}
                      alt={article.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    article.author.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {article.author.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {article.publishedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {article.readTime} min read
                </span>
                <BookmarkButton articleId={article.id} />
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div
            className="prose prose-lg max-w-none mb-8 prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 hover:prose-a:text-primary-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.body) }}
          />

          {/* Source Attribution */}
          {article.sourceUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-900">
                This article was originally published by{' '}
                <strong>{article.sourceName || 'the original source'}</strong>.
              </p>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                Read the full article &rarr;
              </a>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center flex-wrap gap-2 pb-6 border-b border-gray-200 mb-6">
            <span className="text-sm font-medium text-gray-500 mr-1">Tags:</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Social Share */}
          <div className="mb-12">
            <SocialShare url={shareUrl} title={article.title} />
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-5xl mx-auto pb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((relArticle) => (
                <ArticleCard key={relArticle.slug} article={relArticle} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
