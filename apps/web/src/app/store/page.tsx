import { StoreContent } from './store-content';
import type { ProductListingData } from './store-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiProduct {
  slug: string;
  name: string;
  description: string;
  short_description: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_featured: boolean;
  category: { name: string; slug: string } | null;
  images: { url: string; thumbnail_url: string | null; is_primary: boolean }[];
  created_at: string;
}

interface ApiCategory {
  name: string;
  slug: string;
}

function mapApiProduct(p: ApiProduct): ProductListingData {
  const primaryImage = p.images?.find((img) => img.is_primary) || p.images?.[0];
  return {
    slug: p.slug,
    name: p.name,
    shortDescription: p.short_description || p.description?.slice(0, 120) || '',
    basePrice: Number(p.base_price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
    imageUrl: primaryImage?.thumbnail_url || primaryImage?.url || null,
    category: p.category?.name || '',
    categorySlug: p.category?.slug || '',
    isFeatured: p.is_featured,
    createdAt: p.created_at?.split('T')[0] || '',
  };
}

async function getProducts(): Promise<ProductListingData[]> {
  try {
    const res = await fetch(`${API_URL}/store/products?limit=50`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const result = await res.json();
      return (result.data || []).map(mapApiProduct);
    }
  } catch {
    // Network error
  }
  return [];
}

async function getCategories(): Promise<{ name: string; slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/store/categories`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data: ApiCategory[] = await res.json();
      return data.map((c) => ({ name: c.name, slug: c.slug }));
    }
  } catch {
    // Network error
  }
  return [];
}

export default async function StorePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <StoreContent products={products} categories={categories} />
  );
}
