import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClassifiedDetailContent } from './classified-detail-content';
import type { ClassifiedDetailData } from './classified-detail-content';
import type { CategoryFieldDefinition } from '@/types/category-fields';
import { API_URL, SITE_URL } from '@/lib/constants';
import { safeJsonLdStringify } from '@/lib/json-ld';

const CATEGORY_INFO: Record<string, string> = {
  vehicles: 'Vehicles',
  services: 'Services',
  property: 'Property',
  electronics: 'Electronics',
  furniture: 'Furniture',
  jobs: 'Jobs',
  other: 'Other',
};

interface ApiClassified {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  price_type: string;
  condition: string | null;
  description: string;
  location: string | null;
  district: string | null;
  category: { name: string; slug: string; field_schema?: CategoryFieldDefinition[] } | null;
  category_fields?: Record<string, unknown>;
  images: { id: string; url: string | null; thumbnail_url: string | null; sort_order: number }[];
  user: { id: string; display_name: string } | null;
  created_at: string;
  view_count: number;
  featured: boolean;
}

function mapApiClassified(c: ApiClassified): ClassifiedDetailData {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    price: c.price,
    priceType: c.price_type,
    condition: c.condition,
    description: c.description,
    location: c.location,
    district: c.district,
    categorySlug: c.category?.slug || '',
    categoryName: c.category?.name || '',
    categoryFields: c.category_fields || {},
    categoryFieldSchema: c.category?.field_schema || [],
    images: (c.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: c.title,
    })),
    sellerName: c.user?.display_name || 'Anonymous',
    sellerMemberSince: null,
    createdAt: c.created_at?.split('T')[0] || '',
    views: c.view_count || 0,
  };
}

async function getClassified(slug: string): Promise<ClassifiedDetailData | null> {
  try {
    const res = await fetch(`${API_URL}/classifieds/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      return mapApiClassified(data);
    }
  } catch {
    // Network error
  }
  return null;
}

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'Price on request';
  if (price === null) return 'Price on request';
  return `\u20AC${price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const listing = await getClassified(slug);
  if (!listing) return { title: 'Listing Not Found' };

  const plainDesc = listing.description.slice(0, 160);

  return {
    title: `${listing.title} - ${CATEGORY_INFO[category] || category} Classifieds`,
    description: plainDesc,
    openGraph: {
      title: listing.title,
      description: plainDesc,
      type: 'website',
      ...(listing.images[0]?.url && {
        images: [{ url: listing.images[0].url }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: plainDesc,
    },
    alternates: {
      canonical: `${SITE_URL}/classifieds/${category}/${slug}`,
    },
  };
}

export default async function ClassifiedDetailPage({ params }: PageProps) {
  const { category, slug } = await params;
  const listing = await getClassified(slug);

  if (!listing) {
    notFound();
  }

  const categoryName = CATEGORY_INFO[category] || category;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description.slice(0, 300),
    ...(listing.images[0]?.url && { image: listing.images[0].url }),
    ...(listing.price !== null && {
      offers: {
        '@type': 'Offer',
        price: listing.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        itemCondition:
          listing.condition === 'new'
            ? 'https://schema.org/NewCondition'
            : 'https://schema.org/UsedCondition',
      },
    }),
    ...(listing.location && {
      availableAtOrFrom: {
        '@type': 'Place',
        address: listing.location,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <ClassifiedDetailContent
        listing={listing}
        categorySlug={category}
        categoryName={categoryName}
      />
    </>
  );
}
