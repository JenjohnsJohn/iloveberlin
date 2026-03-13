import type { Metadata } from 'next';
import { ClassifiedsContent } from './classifieds-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

interface ApiClassified {
  slug: string;
  title: string;
  price: number | null;
  price_type: string;
  condition: string | null;
  location: string | null;
  district: string | null;
  category: { name: string; slug: string } | null;
  images: { url: string; thumbnail_url: string | null }[];
  created_at: string;
  featured: boolean;
}

import type { CategoryFieldDefinition } from '@/types/category-fields';

interface ApiCategory {
  name: string;
  slug: string;
  field_schema?: CategoryFieldDefinition[];
}

function mapApiClassified(c: ApiClassified): ClassifiedListingData {
  return {
    slug: c.slug,
    title: c.title,
    price: c.price,
    priceType: c.price_type,
    condition: c.condition,
    location: c.location,
    district: c.district,
    category: c.category?.name || '',
    categorySlug: c.category?.slug || '',
    imageUrl: c.images?.[0]?.thumbnail_url || c.images?.[0]?.url || null,
    createdAt: c.created_at?.split('T')[0] || '',
    featured: c.featured,
  };
}

async function getListings(): Promise<ClassifiedListingData[]> {
  try {
    const res = await fetch(`${API_URL}/classifieds?limit=50`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const result = await res.json();
      return (result.data || []).map(mapApiClassified);
    }
  } catch {
    // Network error
  }
  return [];
}

async function getCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${API_URL}/classifieds/categories`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Network error
  }
  return [];
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
    canonical: 'https://iloveberlin.biz/classifieds',
  },
};

export default async function ClassifiedsPage() {
  const [listings, categories] = await Promise.all([
    getListings(),
    getCategories(),
  ]);

  return <ClassifiedsContent listings={listings} categories={categories} />;
}
