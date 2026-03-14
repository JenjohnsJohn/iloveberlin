import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { GuideContent } from './guide-content';
import { buildGuideUrl, fromGuideTopicSeoSlug, toGuideTopicSeoSlug } from '@/lib/guide-seo-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const TOPIC_NAMES: Record<string, string> = {
  'living-in-berlin': 'Living in Berlin',
  transportation: 'Transportation',
  laws: 'Laws & Regulations',
  culture: 'Culture & Lifestyle',
  'visiting-berlin': 'Visiting Berlin',
  'work-and-business': 'Work & Business',
  'places-to-see': 'Places to See',
  'whos-who': "Who's Who",
};

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

interface GuideData {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  last_reviewed_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  topic: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
  featured_image: {
    url: string;
  } | null;
  toc: TocEntry[];
}

async function getGuide(slug: string): Promise<GuideData | null> {
  try {
    const res = await fetch(`${API_URL}/guides/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
  } catch {
    // Network error
  }
  return null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string; slug: string }>;
}): Promise<Metadata> {
  const { topic, slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: 'Guide Not Found' };

  const title = guide.seo_title || guide.title;
  const description =
    guide.seo_description ||
    guide.excerpt ||
    guide.body?.replace(/<[^>]*>/g, '').slice(0, 200) ||
    undefined;

  const topicSlug = guide.topic?.slug || fromGuideTopicSeoSlug(topic) || topic;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: guide.published_at || undefined,
      modifiedTime: guide.updated_at || undefined,
      authors: guide.author ? [guide.author.display_name] : undefined,
      images: guide.featured_image ? [guide.featured_image.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://iloveberlin.biz${buildGuideUrl(slug, topicSlug)}`,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ topic: string; slug: string }>;
}) {
  const { topic, slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    notFound();
  }

  // Validate topic segment matches guide's actual topic
  const actualTopicSlug = guide.topic?.slug || null;
  const expectedTopicSegment = toGuideTopicSeoSlug(actualTopicSlug || 'general');
  if (topic !== expectedTopicSegment) {
    permanentRedirect(buildGuideUrl(slug, actualTopicSlug));
  }

  const topicName = guide.topic?.name || TOPIC_NAMES[actualTopicSlug || ''] || 'Guide';
  const topicSlug = actualTopicSlug || 'general';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description:
      guide.excerpt || guide.body?.replace(/<[^>]*>/g, '').slice(0, 200),
    image: guide.featured_image?.url,
    author: {
      '@type': 'Person',
      name: guide.author?.display_name,
    },
    datePublished: guide.published_at,
    dateModified: guide.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'ILoveBerlin',
      url: 'https://iloveberlin.biz',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://iloveberlin.biz${buildGuideUrl(slug, topicSlug)}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideContent
        guide={{
          slug: guide.slug,
          title: guide.title,
          excerpt: guide.excerpt,
          body: guide.body,
          author: {
            name: guide.author?.display_name || 'Unknown',
            avatarUrl: guide.author?.avatar_url || null,
            bio: guide.author?.bio || null,
          },
          lastReviewed: guide.last_reviewed_at
            ? formatDate(guide.last_reviewed_at)
            : null,
          publishedAt: guide.published_at
            ? formatDate(guide.published_at)
            : null,
          featuredImage: guide.featured_image?.url || null,
          toc: guide.toc,
        }}
        topicName={topicName}
        topicSlug={topicSlug}
      />
    </>
  );
}
