import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { toGuideTopicSeoSlug } from '@/lib/guide-seo-utils';
import { LatestGuideList } from './latest-guide-list';
import type { GuideCardData } from './latest-guide-list';

export const metadata: Metadata = {
  title: 'Berlin Guide',
  description:
    'Your comprehensive guide to living, working, and exploring Berlin. Practical tips, cultural insights, and local knowledge.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
      <section className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Berlin Guide
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Your comprehensive resource for living, working, and exploring
          Berlin. From practical tips to cultural insights, we have got you
          covered.
        </p>
      </section>

      {/* Topics Grid */}
      <section>
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
