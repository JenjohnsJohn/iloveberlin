import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { fromGuideTopicSeoSlug, buildGuideUrl, buildGuideTopicUrl } from '@/lib/guide-seo-utils';
import { formatDate } from '@/lib/format-date';
import { API_URL, SITE_URL } from '@/lib/constants';

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

interface GuideCard {
  slug: string;
  title: string;
  excerpt: string;
  lastReviewed: string | null;
  author: string;
}

interface TopicResponse {
  name: string;
  description: string | null;
  guides: GuideCard[];
}


async function getTopicWithGuides(topicSlug: string): Promise<TopicResponse | null> {
  try {
    const res = await fetch(`${API_URL}/guides/topics/${topicSlug}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;

    const data = await res.json();

    const rawGuides = Array.isArray(data.guides) ? data.guides : [];
    const guides: GuideCard[] = rawGuides.map((g: Record<string, unknown>) => {
      const author = g.author as Record<string, unknown> | null;
      return {
        slug: String(g.slug || ''),
        title: String(g.title || ''),
        excerpt: String(g.excerpt || ''),
        lastReviewed: (g.last_reviewed_at || g.lastReviewed || null) as string | null,
        author: String(
          author?.display_name || author?.name || author?.username ||
          g.author_name || (typeof g.author === 'string' ? g.author : '') || 'Staff Writer'
        ),
      };
    });

    return {
      name: String(data.name || TOPIC_NAMES[topicSlug] || 'Berlin Guide'),
      description: (data.description || null) as string | null,
      guides,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const rawSlug = fromGuideTopicSeoSlug(topic);
  const topicSlug = rawSlug || topic;

  const result = await getTopicWithGuides(topicSlug);
  const topicName = result?.name || TOPIC_NAMES[topicSlug] || 'Berlin Guide';
  const description = result?.description || `Explore guides about ${topicName} in Berlin.`;

  return {
    title: topicName,
    description,
    openGraph: {
      title: topicName,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: topicName,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}${buildGuideTopicUrl(topicSlug)}`,
    },
  };
}

export default async function GuideTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const rawSlug = fromGuideTopicSeoSlug(topic);

  if (!rawSlug) {
    // Not a valid SEO slug — this is a legacy URL like /guide/transportation
    // Try to fetch the topic and redirect to SEO URL
    const result = await getTopicWithGuides(topic);
    if (result) {
      // Topic exists with this raw slug — redirect to SEO URL
      const { permanentRedirect } = await import('next/navigation');
      permanentRedirect(buildGuideTopicUrl(topic));
    }
    notFound();
  }

  // Valid SEO slug — rawSlug is the actual topic slug
  const result = await getTopicWithGuides(rawSlug);

  if (!result) {
    notFound();
  }

  const topicName = result.name;
  const topicDescription = result.description || `Explore guides about ${topicName}.`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guide', href: '/guide' },
            { label: topicName },
          ]}
        />
      </div>

      {/* Topic Header */}
      <section className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {topicName}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          {topicDescription}
        </p>
      </section>

      {/* Guides List */}
      <section>
        {result.guides.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No guides available for this topic yet.</p>
            <Link
              href="/guide"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              &larr; Back to all topics
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.guides.map((guide) => (
              <Link
                key={guide.slug}
                href={buildGuideUrl(guide.slug, rawSlug)}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {guide.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>By {guide.author}</span>
                  {guide.lastReviewed && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Reviewed {formatDate(guide.lastReviewed)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
