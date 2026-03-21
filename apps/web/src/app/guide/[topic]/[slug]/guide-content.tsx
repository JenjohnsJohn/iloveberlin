'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { sanitizeHtml } from '@/lib/sanitize';
import apiClient from '@/lib/api-client';
import { buildGuideUrl, buildGuideTopicUrl } from '@/lib/guide-seo-utils';

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
        <div className="relative mb-8 rounded-xl overflow-hidden h-96">
          <Image
            src={guide.featuredImage}
            alt={guide.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guide', href: '/guide' },
            { label: topicName, href: buildGuideTopicUrl(topicSlug) },
            { label: guide.title },
          ]}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Table of Contents */}
        <aside className="lg:w-72 flex-shrink-0 order-2 lg:order-1">
          <div className="lg:sticky lg:top-24 bg-gray-50/80 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Table of Contents
            </h2>
            <nav aria-label="Table of contents" className="border-l-2 border-gray-200">
              {guide.toc.map((entry) => (
                <a
                  key={entry.id}
                  href={`#${entry.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(entry.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      history.replaceState(null, '', `#${entry.id}`);
                    }
                  }}
                  className={`block text-sm py-1.5 transition-all duration-200 border-l-2 -ml-0.5 ${
                    entry.level === 3 ? 'pl-6' : 'pl-4'
                  } ${
                    activeId === entry.id
                      ? 'border-primary-600 text-primary-700 font-medium bg-primary-50/60 rounded-r-md'
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
                    <Image
                      src={guide.author.avatarUrl}
                      alt={guide.author.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-full"
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
              <div className="flex items-center gap-4 text-sm">
                {guide.lastReviewed && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium text-xs">
                    <svg
                      className="w-4 h-4 text-green-500"
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
                    Last updated {guide.lastReviewed}
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
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-10 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0 overflow-hidden ring-2 ring-primary-200 ring-offset-2">
                {guide.author.avatarUrl ? (
                  <Image
                    src={guide.author.avatarUrl}
                    alt={guide.author.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  guide.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-0.5">About the Author</p>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {guide.author.name}
                </h3>
                {guide.author.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">{guide.author.bio}</p>
                )}
                {guide.lastReviewed && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600 mt-3 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                    href={buildGuideUrl(related.slug, topicSlug)}
                    className="group bg-white rounded-lg border border-gray-200 border-l-4 border-l-primary-500 p-5 hover:shadow-primary-glow hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm group-hover:text-primary-700 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                      {related.excerpt}
                    </p>
                    <span className="inline-flex items-center text-xs font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                      Read guide
                      <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
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
