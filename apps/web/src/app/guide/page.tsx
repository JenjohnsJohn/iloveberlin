import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toGuideTopicSeoSlug } from '@/lib/guide-seo-utils';
import { LatestGuideList } from './latest-guide-list';
import type { GuideCardData } from './latest-guide-list';
import { API_URL, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Berlin Guide',
  description:
    'Your comprehensive guide to living, working, and exploring Berlin. Practical tips, cultural insights, and local knowledge.',
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
};

async function getTopics(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/guides/topics/tree`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const topics = Array.isArray(data) ? data : data.data ?? [];
      if (topics.length > 0) {
        return topics.map((t: Record<string, unknown>) => ({
          name: String(t.name || ''),
          slug: String(t.slug || ''),
          icon: (t.icon || null) as string | null,
          description: (t.description || null) as string | null,
          listing_count: typeof t.listing_count === 'number' ? t.listing_count : undefined,
          children: Array.isArray(t.children)
            ? (t.children as Record<string, unknown>[]).map((child) => ({
                name: String(child.name || ''),
                slug: String(child.slug || ''),
                listing_count: typeof child.listing_count === 'number' ? child.listing_count : undefined,
              }))
            : [],
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load guide topics:', err);
  }
  return [];
}

async function getLatestGuides(): Promise<{ guides: GuideCardData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/guides?limit=6&sort=date&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const guides = (items as Record<string, unknown>[]).map((g) => {
        const author = g.author as Record<string, unknown> | null;
        const topic = g.topic as Record<string, unknown> | null;
        return {
          slug: String(g.slug || ''),
          title: String(g.title || ''),
          excerpt: String(g.excerpt || ''),
          lastReviewed: (g.last_reviewed_at || g.lastReviewed || null) as string | null,
          author: String(
            author?.display_name || author?.name || author?.username ||
            g.author_name || (typeof g.author === 'string' ? g.author : '') || 'Staff Writer'
          ),
          topicSlug: String(topic?.slug || g.topic_slug || ''),
        };
      });
      return { guides, total };
    }
  } catch (err) {
    console.error('Failed to load latest guides:', err);
  }
  return { guides: [], total: 0 };
}

export default async function GuideLandingPage() {
  const [topics, { guides: latestGuides, total: guidesTotal }] = await Promise.all([
    getTopics(),
    getLatestGuides(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="text-center mb-10 py-8 bg-gradient-to-b from-primary-50/60 to-transparent rounded-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          Your Berlin Resource
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Berlin Guide
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your comprehensive resource for living, working, and exploring
          Berlin. From practical tips to cultural insights, we have got you
          covered.
        </p>
      </section>

      {/* Topics Grid */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Browse by Topic</h2>
        <CategoryGrid
          categories={topics}
          basePath="/guide"
          slugTransform={toGuideTopicSeoSlug}
          emptyMessage="No guide topics available yet. Check back soon!"
        />
      </section>

      <LatestGuideList initialGuides={latestGuides} initialTotal={guidesTotal} />
    </div>
  );
}
