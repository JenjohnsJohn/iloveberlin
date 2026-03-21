import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailContent } from './product-detail-content';
import type { ProductDetailData, RelatedProductData } from './product-detail-content';
import { API_URL, SITE_URL } from '@/lib/constants';
import { safeJsonLdStringify } from '@/lib/json-ld';

interface ApiProduct {
  slug: string;
  name: string;
  description: string;
  short_description: string | null;
  base_price: number;
  compare_at_price: number | null;
  sku: string | null;
  is_featured: boolean;
  category: { name: string; slug: string } | null;
  images: { id: string; url: string | null; thumbnail_url: string | null; alt_text: string | null; is_primary: boolean; sort_order: number }[];
  variants: { id: string; name: string; sku: string; price: number; is_active: boolean }[];
}

function mapApiProduct(p: ApiProduct): ProductDetailData {
  const inferVariantType = (name: string): string => {
    if (/^(xs|s|m|l|xl|xxl|\d+x\d+)/i.test(name)) return 'Size';
    if (/^(red|blue|green|black|white|gold|silver|grey|gray)/i.test(name)) return 'Color';
    return 'Option';
  };

  return {
    slug: p.slug,
    name: p.name,
    description: p.description,
    shortDescription: p.short_description || p.description?.slice(0, 120) || '',
    basePrice: Number(p.base_price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
    images: (p.images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt_text || p.name,
      })),
    category: p.category?.name || '',
    categorySlug: p.category?.slug || '',
    sku: p.sku || '',
    variants: (p.variants || [])
      .filter((v) => v.is_active)
      .map((v) => ({
        id: v.id,
        name: v.name,
        type: inferVariantType(v.name),
        price: Number(v.price),
      })),
    isFeatured: p.is_featured,
  };
}

async function getProduct(slug: string): Promise<ProductDetailData | null> {
  try {
    const res = await fetch(`${API_URL}/store/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.slug) return mapApiProduct(data);
    }
  } catch {
    // Network error
  }
  return null;
}

async function getRelatedProducts(currentSlug: string): Promise<RelatedProductData[]> {
  try {
    const res = await fetch(`${API_URL}/store/products?limit=4`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const result = await res.json();
      return (result.data || [])
        .filter((p: ApiProduct) => p.slug !== currentSlug)
        .slice(0, 4)
        .map((p: ApiProduct) => {
          const primaryImage = p.images?.find((img) => img.is_primary) || p.images?.[0];
          return {
            slug: p.slug,
            name: p.name,
            basePrice: Number(p.base_price),
            compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
            category: p.category?.name || '',
            imageUrl: primaryImage?.thumbnail_url || primaryImage?.url || null,
          };
        });
    }
  } catch {
    // Network error
  }
  return [];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found' };

  const plainDesc = product.shortDescription || product.description.slice(0, 160);

  return {
    title: `${product.name} - Berlin Store`,
    description: plainDesc,
    openGraph: {
      title: product.name,
      description: plainDesc,
      type: 'website',
      ...(product.images[0]?.url && {
        images: [{ url: product.images[0].url }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: plainDesc,
    },
    alternates: {
      canonical: `${SITE_URL}/store/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description.slice(0, 300),
    ...(product.sku && { sku: product.sku }),
    ...(product.images[0]?.url && { image: product.images[0].url }),
    ...(product.category && {
      category: product.category,
    }),
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      ...(product.compareAtPrice && {
        priceValidUntil: '2027-12-31',
      }),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <ProductDetailContent
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
