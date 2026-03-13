'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { sanitizeHtml } from '@/lib/sanitize';
import apiClient from '@/lib/api-client';

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

interface GuideContentProps {
  guide: {
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    author: {
      name: string;
      avatarUrl: string | null;
      bio: string | null;
    };
    lastReviewed: string | null;
    publishedAt: string | null;
    featuredImage: string | null;
    toc: TocEntry[];
  };
  topicName: string;
  topicSlug: string;
}

interface RelatedGuide {
  slug: string;
  title: string;
  excerpt: string;
}

export function GuideContent({ guide, topicName, topicSlug }: GuideContentProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [relatedGuides, setRelatedGuides] = useState<RelatedGuide[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    );

    const headings = document.querySelectorAll('h2[id], h3[id]');
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  // Track page view
  useEffect(() => {
    apiClient.post('/analytics/pageview', { path: `/guide/${topicSlug}/${guide.slug}` }).catch(() => {});
  }, [topicSlug, guide.slug]);

  // Fetch related guides from the same topic
  useEffect(() => {
    if (!topicSlug) return;
    apiClient.get(`/guides/topics/${topicSlug}`)
      .then(({ data }) => {
        const rawGuides = Array.isArray(data.guides) ? data.guides : [];
        const others = rawGuides
          .filter((g: Record<string, unknown>) => g.slug !== guide.slug)
          .slice(0, 3)
          .map((g: Record<string, unknown>) => ({
            slug: String(g.slug || ''),
            title: String(g.title || ''),
            excerpt: String(g.excerpt || ''),
          }));
        setRelatedGuides(others);
      })
      .catch(() => {
        // Silently fail - related guides are supplementary
      });
  }, [topicSlug, guide.slug]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Image */}
      {guide.featuredImage && (
        <div className="mb-8 rounded-xl overflow-hidden max-h-96">
          <img
            src={guide.featuredImage}
            alt={guide.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guide', href: '/guide' },
            { label: topicName, href: `/guide/${topicSlug}` },
            { label: guide.title },
          ]}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Table of Contents */}
        <aside className="lg:w-72 flex-shrink-0 order-2 lg:order-1">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Table of Contents
            </h2>
            <nav aria-label="Table of contents" className="border-l-2 border-gray-200">
              {guide.toc.map((entry) => (
                <a
                  key={entry.id}
                  href={`#${entry.id}`}
                  className={`block text-sm py-1.5 transition-colors border-l-2 -ml-0.5 ${
                    entry.level === 3 ? 'pl-6' : 'pl-4'
                  } ${
                    activeId === entry.id
                      ? 'border-primary-600 text-primary-700 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-400'
                  }`}
                >
                  {entry.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 min-w-0 order-1 lg:order-2">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {guide.title}
            </h1>

            {guide.excerpt && (
              <p className="text-lg text-gray-600 mb-6">{guide.excerpt}</p>
            )}

            {/* Author & Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden">
                  {guide.author.avatarUrl ? (
                    <img
                      src={guide.author.avatarUrl}
                      alt={guide.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    guide.author.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {guide.author.name}
                  </p>
                  {guide.author.bio && (
                    <p className="text-xs text-gray-500">{guide.author.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {guide.lastReviewed && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Reviewed {guide.lastReviewed}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Guide Body */}
          <div
            className="prose prose-lg max-w-none mb-10 prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.body) }}
          />

          {/* Author Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-10 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0 overflow-hidden">
                {guide.author.avatarUrl ? (
                  <img
                    src={guide.author.avatarUrl}
                    alt={guide.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  guide.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Written by {guide.author.name}
                </h3>
                {guide.author.bio && (
                  <p className="text-sm text-gray-600">{guide.author.bio}</p>
                )}
                {guide.lastReviewed && (
                  <p className="text-xs text-gray-400 mt-2">
                    Last reviewed: {guide.lastReviewed}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedGuides.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/guide/${topicSlug}/${related.slug}`}
                    className="group bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm group-hover:text-primary-700 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
