'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ClassifiedListingData } from '../page';
import type { CategoryFieldDefinition } from '@/types/category-fields';
import { CategoryFilters } from '@/components/classifieds/category-filters';

const DISTRICTS = [
  'All Districts', 'Mitte', 'Kreuzberg', 'Friedrichshain', 'Prenzlauer Berg',
  'Neukoelln', 'Charlottenburg', 'Schoeneberg', 'Tempelhof', 'Wedding', 'Moabit',
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

interface SubcategoryData {
  name: string;
  slug: string;
}

interface CategoryContentProps {
  categorySlug: string;
  categoryName: string;
  categoryDescription: string;
  listings: ClassifiedListingData[];
  fieldSchema?: CategoryFieldDefinition[];
  subcategories?: SubcategoryData[];
}

export function CategoryContent({ categorySlug, categoryName, categoryDescription, listings, fieldSchema = [], subcategories = [] }: CategoryContentProps) {
  const [activeDistrict, setActiveDistrict] = useState('All Districts');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [categoryFieldFilters, setCategoryFieldFilters] = useState<Record<string, string>>({});

  const filteredListings = listings.filter((listing) => {
    if (activeSubcategory && listing.categorySlug !== activeSubcategory) return false;
    if (activeDistrict !== 'All Districts' && listing.district !== activeDistrict) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!listing.title.toLowerCase().includes(q) && !(listing.location || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const visibleListings = filteredListings.slice(0, displayCount);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/classifieds" className="hover:text-primary-600">Classifieds</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{categoryName}</span>
      </nav>

      {/* Header */}
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <p className="text-gray-600">{categoryDescription}</p>
      </section>

      {/* Subcategory Tabs */}
      {subcategories.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter by subcategory">
            <button
              onClick={() => { setActiveSubcategory(null); setDisplayCount(20); }}
              role="tab"
              aria-selected={activeSubcategory === null}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeSubcategory === null
                  ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All {categoryName}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => { setActiveSubcategory(sub.slug); setDisplayCount(20); }}
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
        </section>
      )}

      {/* Filters */}
      <section className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="category-search" className="sr-only">Search in {categoryName}</label>
          <input
            id="category-search"
            type="text"
            placeholder={`Search in ${categoryName}...`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setDisplayCount(20); }}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex-shrink-0">
          <label htmlFor="cat-district-filter" className="sr-only">Filter by district</label>
          <select
            id="cat-district-filter"
            value={activeDistrict}
            onChange={(e) => { setActiveDistrict(e.target.value); setDisplayCount(20); }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </section>

      {/* Category-specific filters */}
      {fieldSchema.length > 0 && (
        <section className="mb-6">
          <CategoryFilters
            fieldSchema={fieldSchema}
            values={categoryFieldFilters}
            onChange={(key, value) => {
              setCategoryFieldFilters((prev) => ({ ...prev, [key]: value }));
              setDisplayCount(20);
            }}
            onClear={() => { setCategoryFieldFilters({}); setDisplayCount(20); }}
          />
        </section>
      )}

      {/* Results */}
      <section>
        <div className="text-sm text-gray-500 mb-4">
          {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
        </div>

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
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">{listing.title}</h3>
                    <div className="text-xl font-bold text-primary-700 mb-2">{formatPrice(listing.price, listing.priceType)}</div>
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
            <p className="text-gray-500 text-lg">No listings found in {categoryName}.</p>
            <Link href="/classifieds" className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium">
              Browse all categories
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
