import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { LatestClassifiedList } from './latest-classified-list';
import { API_URL, SITE_URL } from '@/lib/constants';

export interface ClassifiedListingData {
  slug: string;
  title: string;
  price: number | null;
  priceType: string;
  condition: string | null;
  location: string | null;
  district: string | null;
  category: string;
  categorySlug: string;
  imageUrl: string | null;
  createdAt: string;
  featured: boolean;
}

export const metadata: Metadata = {
  title: 'Berlin Classifieds - Buy, Sell & Discover',
  description:
    'Buy, sell, and discover goods and services in Berlin. From apartments and vehicles to electronics and jobs.',
  openGraph: {
    title: 'Berlin Classifieds - Buy, Sell & Discover',
    description:
      'Buy, sell, and discover goods and services in Berlin.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berlin Classifieds',
  },
  alternates: {
    canonical: `${SITE_URL}/classifieds`,
  },
};

interface ApiCategory {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  listing_count?: number;
  children?: ApiCategory[];
}

async function getCategories(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/classifieds/categories`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data: ApiCategory[] = await res.json();
      return data.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        icon: c.icon || null,
        listing_count: typeof c.listing_count === 'number' ? c.listing_count : undefined,
        children: c.children?.map((child) => ({
          name: child.name,
          slug: child.slug,
          listing_count: typeof child.listing_count === 'number' ? child.listing_count : undefined,
        })) || [],
      }));
    }
  } catch (err) {
    console.error('Failed to load classifieds categories:', err);
  }
  return [];
}

async function getLatestListings(): Promise<{ listings: ClassifiedListingData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/classifieds?limit=6&sort=date&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const listings = (items as Record<string, unknown>[]).map((c) => {
        const category = c.category as Record<string, unknown> | null;
        const images = c.images as Record<string, unknown>[] | null;
        return {
          slug: String(c.slug || ''),
          title: String(c.title || ''),
          price: (c.price ?? null) as number | null,
          priceType: String(c.price_type || ''),
          condition: (c.condition || null) as string | null,
          location: (c.location || null) as string | null,
          district: (c.district || null) as string | null,
          category: String(category?.name || ''),
          categorySlug: String(category?.slug || ''),
          imageUrl: (images?.[0]?.thumbnail_url || images?.[0]?.url || null) as string | null,
          createdAt: ((c.created_at as string)?.split('T')[0] || '') as string,
          featured: Boolean(c.featured),
        };
      });
      return { listings, total };
    }
  } catch (err) {
    console.error('Failed to load latest classifieds:', err);
  }
  return { listings: [], total: 0 };
}

export default async function ClassifiedsPage() {
  const [categories, { listings: latestListings, total: listingsTotal }] = await Promise.all([
    getCategories(),
    getLatestListings(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Berlin Classifieds
        </h1>
        <div className="w-12 h-1 bg-emerald-500 rounded-full mx-auto mb-3" />
        <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6">
          Buy, sell, and discover goods and services in Berlin. From apartments
          to electronics, find what you need in your neighbourhood.
        </p>
        <Link
          href="/classifieds/create"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all font-semibold text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post a Listing
        </Link>
      </section>

      {/* Category Grid */}
      <section>
        <CategoryGrid
          categories={categories}
          basePath="/classifieds"
          emptyMessage="No classifieds categories available yet. Check back soon!"
        />
      </section>

      <LatestClassifiedList initialListings={latestListings} initialTotal={listingsTotal} />
    </div>
  );
}
