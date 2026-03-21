'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

export interface ProductListingData {
  slug: string;
  name: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string;
  categorySlug: string;
  isFeatured: boolean;
  createdAt: string;
}

const SORT_OPTIONS = [
  { label: 'Sort by: Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

interface CategoryNode {
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
}

interface StoreContentProps {
  products: ProductListingData[];
  categories: CategoryNode[];
}

export function StoreContent({ products, categories }: StoreContentProps) {
  const [activeRootSlug, setActiveRootSlug] = useState<string>('');
  const [activeSubcategorySlug, setActiveSubcategorySlug] = useState<string>('');
  const [sortBy, setSortBy] = useState('default');
  const [displayCount, setDisplayCount] = useState(20);

  const activeCategory = activeSubcategorySlug || activeRootSlug || 'all';

  const featuredProducts = products.filter((p) => p.isFeatured);

  const matchingSlugs = useMemo(() => {
    if (!activeRootSlug) return null;
    const slugs = new Set<string>();
    if (activeSubcategorySlug) {
      slugs.add(activeSubcategorySlug);
    } else {
      slugs.add(activeRootSlug);
      const root = categories.find((c) => c.slug === activeRootSlug);
      root?.children?.forEach((sub) => slugs.add(sub.slug));
    }
    return slugs;
  }, [activeRootSlug, activeSubcategorySlug, categories]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      if (matchingSlugs && !matchingSlugs.has(product.categorySlug)) {
        return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return result;
  }, [products, matchingSlugs, sortBy]);

  const visibleProducts = filteredProducts.slice(0, displayCount);

  // Reset displayCount when filters or sort change
  useEffect(() => {
    setDisplayCount(20);
  }, [activeRootSlug, activeSubcategorySlug, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Berlin Store
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover unique Berlin-inspired products, from apparel and art to
          artisan food and gifts. Take a piece of Berlin home with you.
        </p>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <section className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter by category">
          <button
            onClick={() => { setActiveRootSlug(''); setActiveSubcategorySlug(''); }}
            role="tab"
            aria-selected={!activeRootSlug}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !activeRootSlug
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setActiveRootSlug(cat.slug); setActiveSubcategorySlug(''); }}
              role="tab"
              aria-selected={activeRootSlug === cat.slug}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeRootSlug === cat.slug
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategory pills */}
        {activeRootSlug && (() => {
          const root = categories.find((c) => c.slug === activeRootSlug);
          const subs = root?.children || [];
          if (subs.length === 0) return null;
          return (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-3">
              <button
                onClick={() => setActiveSubcategorySlug('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  !activeSubcategorySlug
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                All {root?.name}
              </button>
              {subs.map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() => setActiveSubcategorySlug(sub.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSubcategorySlug === sub.slug
                      ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Sort + Count */}
      <section className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
        <div>
          <label htmlFor="store-sort" className="sr-only">Sort products</label>
          <select
            id="store-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* All Products Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {!activeRootSlug
            ? 'All Products'
            : categories.find((t) => t.slug === activeRootSlug)?.name || 'Products'}
        </h2>
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
            {visibleProducts.length < filteredProducts.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Load More Products ({filteredProducts.length - visibleProducts.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="No products found"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              No products found in this category.
            </p>
            <button
              onClick={() => { setActiveRootSlug(''); setActiveSubcategorySlug(''); }}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all products
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: ProductListingData }) {
  return (
    <Link
      href={`/store/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-primary-300">
            <svg
              className="w-16 h-16"
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
        )}
        {product.compareAtPrice && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Sale
          </span>
        )}
        {product.isFeatured && !product.compareAtPrice && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </span>
        )}
        <span className="absolute top-2 right-2 px-2.5 py-1 bg-gray-800 text-white text-xs font-semibold rounded-full">
          {product.category}
        </span>
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.shortDescription}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {'\u20AC'}{product.basePrice.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {'\u20AC'}{product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
