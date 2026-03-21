'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CategoryFieldDefinition } from '@/types/category-fields';

interface ClassifiedListingData {
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
import { CategoryFilters } from '@/components/classifieds/category-filters';

const DISTRICTS = [
  'All Districts', 'Mitte', 'Kreuzberg', 'Friedrichshain', 'Prenzlauer Berg',
  'Neukoelln', 'Charlottenburg', 'Schoeneberg', 'Tempelhof', 'Wedding', 'Moabit',
];

const CONDITIONS = [
  { label: 'Any Condition', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
];

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'Price on request';
  if (price === null) return 'Price on request';
  return `\u20AC${price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatCondition(condition: string | null): string | null {
  if (!condition) return null;
  const map: Record<string, string> = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };
  return map[condition] || condition;
}

interface CategoryData {
  name: string;
  slug: string;
  field_schema?: CategoryFieldDefinition[];
  children?: CategoryData[];
}

interface ClassifiedsContentProps {
  listings: ClassifiedListingData[];
  categories: CategoryData[];
}

export function ClassifiedsContent({ listings, categories }: ClassifiedsContentProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [activeCondition, setActiveCondition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [categoryFieldFilters, setCategoryFieldFilters] = useState<Record<string, string>>({});

  // Find the active root category and its subcategories
  const activeRoot = categories.find((c) => c.slug === activeCategory);
  const subcategories = activeRoot?.children || [];

  // Build the set of category slugs that match the current filter
  const matchingSlugs = new Set<string>();
  if (activeCategory !== 'all') {
    if (activeSubcategory) {
      // Specific subcategory selected — match it and its children
      matchingSlugs.add(activeSubcategory);
      const subcat = subcategories.find((s) => s.slug === activeSubcategory);
      subcat?.children?.forEach((c) => matchingSlugs.add(c.slug));
    } else {
      // Root category selected — match root + all descendants
      matchingSlugs.add(activeCategory);
      subcategories.forEach((sub) => {
        matchingSlugs.add(sub.slug);
        sub.children?.forEach((c) => matchingSlugs.add(c.slug));
      });
    }
  }

  // Determine active field schema (subcategory inherits from root if empty)
  const activeCategorySchema = (() => {
    if (activeCategory === 'all') return [];
    if (activeSubcategory) {
      const subcat = subcategories.find((s) => s.slug === activeSubcategory);
      if (subcat?.field_schema?.length) return subcat.field_schema;
    }
    return activeRoot?.field_schema || [];
  })();

  const categoryTabs = [
    { name: 'All', slug: 'all' },
    ...categories,
  ];

  const filteredListings = listings.filter((listing) => {
    if (activeCategory !== 'all' && !matchingSlugs.has(listing.categorySlug)) return false;
    if (activeDistrict !== 'All Districts' && listing.district !== activeDistrict) return false;
    if (activeCondition && listing.condition !== activeCondition) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!listing.title.toLowerCase().includes(q) && !(listing.location || '').toLowerCase().includes(q)) return false;
    }
    if (priceMin && listing.price !== null && listing.price < Number(priceMin)) return false;
    if (priceMax && listing.price !== null && listing.price > Number(priceMax)) return false;
    return true;
  });

  const visibleListings = filteredListings.slice(0, displayCount);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Berlin Classifieds</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Buy, sell, and discover goods and services in Berlin. From apartments to electronics, find what you need in your neighbourhood.
        </p>
        <Link
          href="/classifieds/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post a Listing
        </Link>
      </section>

      {/* Search Bar */}
      <section className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search classifieds..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setDisplayCount(20); }}
            aria-label="Search classifieds"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter by category">
          {categoryTabs.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setActiveCategory(cat.slug); setActiveSubcategory(null); setCategoryFieldFilters({}); setDisplayCount(20); }}
              role="tab"
              aria-selected={activeCategory === cat.slug}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategory Tabs */}
        {subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-3" role="tablist" aria-label="Filter by subcategory">
            <button
              onClick={() => { setActiveSubcategory(null); setCategoryFieldFilters({}); setDisplayCount(20); }}
              role="tab"
              aria-selected={activeSubcategory === null}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeSubcategory === null
                  ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All {activeRoot?.name}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => { setActiveSubcategory(sub.slug); setCategoryFieldFilters({}); setDisplayCount(20); }}
                role="tab"
                aria-selected={activeSubcategory === sub.slug}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSubcategory === sub.slug
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Filters Row */}
      <section className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0">
          <label htmlFor="district-filter" className="sr-only">Filter by district</label>
          <select
            id="district-filter"
            value={activeDistrict}
            onChange={(e) => { setActiveDistrict(e.target.value); setDisplayCount(20); }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex-shrink-0">
          <label htmlFor="condition-filter" className="sr-only">Filter by condition</label>
          <select
            id="condition-filter"
            value={activeCondition}
            onChange={(e) => { setActiveCondition(e.target.value); setDisplayCount(20); }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="price-min" className="sr-only">Minimum price</label>
          <input id="price-min" type="number" placeholder="Min price" value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setDisplayCount(20); }} className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          <span className="text-gray-400">-</span>
          <label htmlFor="price-max" className="sr-only">Maximum price</label>
          <input id="price-max" type="number" placeholder="Max price" value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setDisplayCount(20); }} className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
      </section>

      {/* Category-specific filters */}
      {activeCategorySchema.length > 0 && (
        <section className="mb-6">
          <CategoryFilters
            fieldSchema={activeCategorySchema}
            values={categoryFieldFilters}
            onChange={(key, value) => {
              setCategoryFieldFilters((prev) => ({ ...prev, [key]: value }));
              setDisplayCount(20);
            }}
            onClear={() => { setCategoryFieldFilters({}); setDisplayCount(20); }}
          />
        </section>
      )}

      {/* Listings Grid */}
      <section>
        {filteredListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleListings.map((listing) => (
                <Link
                  key={listing.slug}
                  href={`/classifieds/${listing.categorySlug}/${listing.slug}`}
                  className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                      </div>
                    )}
                    {listing.featured && <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">Featured</span>}
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">{listing.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">{listing.title}</h3>
                    <div className="text-xl font-bold text-primary-700 mb-2">
                      {formatPrice(listing.price, listing.priceType)}
                      {listing.priceType === 'negotiable' && <span className="text-xs font-normal text-gray-500 ml-1">(negotiable)</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="truncate">{listing.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {listing.condition ? <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{formatCondition(listing.condition)}</span> : <span />}
                      <span className="text-xs text-gray-400">{listing.createdAt}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {visibleListings.length < filteredListings.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Load More Listings ({filteredListings.length - visibleListings.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img" aria-label="No listings found">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No listings found matching your filters.</p>
            <button
              onClick={() => { setActiveCategory('all'); setActiveSubcategory(null); setActiveDistrict('All Districts'); setActiveCondition(''); setSearchQuery(''); setPriceMin(''); setPriceMax(''); setCategoryFieldFilters({}); setDisplayCount(20); }}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
