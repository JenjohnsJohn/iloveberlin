import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/ui/category-grid';
import type { CategoryCardData } from '@/components/ui/category-grid';
import { LatestProductList } from './latest-product-list';
import type { ProductListingData } from './latest-product-list';
import { API_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Berlin Store',
  description:
    'Discover unique Berlin-inspired products, from apparel and art to artisan food and gifts. Take a piece of Berlin home with you.',
};

interface ApiCategory {
  name: string;
  slug: string;
  description?: string | null;
  listing_count?: number;
  children?: ApiCategory[];
}

async function getCategories(): Promise<CategoryCardData[]> {
  try {
    const res = await fetch(`${API_URL}/store/categories/tree`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data: ApiCategory[] = await res.json();
      return data.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        icon: null,
        listing_count: typeof c.listing_count === 'number' ? c.listing_count : undefined,
        children: c.children?.map((child) => ({
          name: child.name,
          slug: child.slug,
          listing_count: typeof child.listing_count === 'number' ? child.listing_count : undefined,
        })) || [],
      }));
    }
  } catch (err) {
    console.error('Failed to load store categories:', err);
  }
  return [];
}

async function getLatestProducts(): Promise<{ products: ProductListingData[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/store/products?limit=6&sort=created&order=desc`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data ?? [];
      const total = json.total ?? 0;
      const products = (items as Record<string, unknown>[]).map((p) => {
        const images = p.images as Record<string, unknown>[] | undefined;
        const primaryImage = images?.find((img) => img.is_primary) || images?.[0];
        const category = p.category as Record<string, unknown> | null;
        return {
          slug: String(p.slug || ''),
          name: String(p.name || ''),
          shortDescription: String(p.short_description || (p.description as string)?.slice(0, 120) || ''),
          basePrice: Number(p.base_price || 0),
          compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
          imageUrl: (primaryImage?.thumbnail_url || primaryImage?.url || null) as string | null,
          category: String(category?.name || ''),
          categorySlug: String(category?.slug || ''),
          isFeatured: Boolean(p.is_featured),
        };
      });
      return { products, total };
    }
  } catch (err) {
    console.error('Failed to load latest products:', err);
  }
  return { products: [], total: 0 };
}

export default async function StorePage() {
  const [categories, { products: latestProducts, total: productsTotal }] = await Promise.all([
    getCategories(),
    getLatestProducts(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Berlin Store
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Discover unique Berlin-inspired products, from apparel and art to
          artisan food and gifts. Take a piece of Berlin home with you.
        </p>
      </section>

      {/* Category Grid */}
      <section>
        <CategoryGrid
          categories={categories}
          basePath="/store/category"
          emptyMessage="No product categories available yet. Check back soon!"
        />
      </section>

      <LatestProductList initialProducts={latestProducts} initialTotal={productsTotal} />
    </div>
  );
}
