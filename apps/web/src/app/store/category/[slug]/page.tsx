import type { Metadata } from 'next';
import { StoreCategoryContent } from './store-category-content';
import { API_URL } from '@/lib/constants';

interface ApiCategory {
  name: string;
  slug: string;
  children?: ApiCategory[];
}

async function getCategoryName(slug: string): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/store/categories/tree`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data: ApiCategory[] = await res.json();
      for (const cat of data) {
        if (cat.slug === slug) return cat.name;
        if (cat.children) {
          for (const child of cat.children) {
            if (child.slug === slug) return child.name;
          }
        }
      }
    }
  } catch {
    // API error
  }
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = await getCategoryName(slug);

  return {
    title: `${categoryName} - Berlin Store - ILOVEBERLIN`,
    description: `Shop ${categoryName.toLowerCase()} products from Berlin.`,
    openGraph: {
      title: `${categoryName} - Berlin Store`,
      description: `Shop ${categoryName.toLowerCase()} products from Berlin.`,
    },
  };
}

export default async function StoreCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = await getCategoryName(slug);

  return <StoreCategoryContent categorySlug={slug} categoryName={categoryName} />;
}
