import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryContent } from './category-content';
import type { ClassifiedListingData } from '../page';
import type { CategoryFieldDefinition } from '@/types/category-fields';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const CATEGORY_INFO: Record<string, { name: string; description: string }> = {
  vehicles: { name: 'Vehicles', description: 'Cars, motorcycles, bicycles and other vehicles for sale in Berlin.' },
  services: { name: 'Services', description: 'Professional and personal services available across Berlin.' },
  property: { name: 'Property', description: 'Apartments, rooms, and commercial spaces in Berlin.' },
  electronics: { name: 'Electronics', description: 'Computers, phones, gadgets and accessories.' },
  furniture: { name: 'Furniture', description: 'Home furniture, decor and appliances.' },
  jobs: { name: 'Jobs', description: 'Job listings and employment opportunities in Berlin.' },
  other: { name: 'Other', description: 'Miscellaneous items and listings.' },
};

interface ApiCategoryDetail {
  name: string;
  slug: string;
  description: string | null;
  parent: { name: string; slug: string } | null;
  children: { name: string; slug: string }[];
}

async function getCategoryInfo(slug: string): Promise<{ name: string; description: string } | null> {
  // Check hardcoded root categories first
  if (CATEGORY_INFO[slug]) return CATEGORY_INFO[slug];
  // Otherwise fetch from API (handles subcategory slugs)
  try {
    const res = await fetch(`${API_URL}/classifieds/categories/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data: ApiCategoryDetail = await res.json();
      return { name: data.name, description: data.description || `Browse ${data.name} listings in Berlin.` };
    }
  } catch {
    // Network error
  }
  return null;
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

async function getCategoryListings(categorySlug: string): Promise<ClassifiedListingData[]> {
  try {
    const res = await fetch(`${API_URL}/classifieds?category=${categorySlug}&limit=50`, {
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

async function getCategorySchema(slug: string): Promise<CategoryFieldDefinition[]> {
  try {
    const res = await fetch(`${API_URL}/classifieds/categories/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return data.field_schema || [];
    }
  } catch {
    // Network error
  }
  return [];
}

async function getSubcategories(slug: string): Promise<{ name: string; slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/classifieds/categories/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data: ApiCategoryDetail = await res.json();
      return (data.children || []).map((c) => ({ name: c.name, slug: c.slug }));
    }
  } catch {
    // Network error
  }
  return [];
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const info = await getCategoryInfo(category);
  if (!info) return { title: 'Category Not Found' };

  return {
    title: `${info.name} Classifieds in Berlin - ILOVEBERLIN`,
    description: info.description,
    openGraph: {
      title: `${info.name} Classifieds in Berlin`,
      description: info.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${info.name} Classifieds in Berlin`,
    },
    alternates: {
      canonical: `https://iloveberlin.biz/classifieds/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const info = await getCategoryInfo(category);
  if (!info) notFound();

  const [listings, fieldSchema, subcategories] = await Promise.all([
    getCategoryListings(category),
    getCategorySchema(category),
    getSubcategories(category),
  ]);

  return (
    <CategoryContent
      categorySlug={category}
      categoryName={info.name}
      categoryDescription={info.description}
      listings={listings}
      fieldSchema={fieldSchema}
      subcategories={subcategories}
    />
  );
}
