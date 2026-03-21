'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import { sanitizeHtml } from '@/lib/sanitize';
import apiClient from '@/lib/api-client';
import { buildDiningCuisineUrl } from '@/lib/dining-seo-utils';

interface RestaurantContentProps {
  restaurant: {
    id: string;
    slug: string;
    name: string;
    description: string;
    featuredImage: string | null;
    cuisines: string[];
    cuisineSlugs: string[];
    priceRange: string;
    rating: number | null;
    address: string;
    district: string | null;
    phone: string | null;
    website: string | null;
    openingHours: Record<string, string>;
    images: { url: string; caption: string | null }[];
    offers: {
      id: string;
      title: string;
      description: string | null;
      start_date: string;
      end_date: string;
    }[];
  };
}

function priceRangeInfo(range: string): { symbol: string; label: string; gradient: string } {
  switch (range) {
    case 'budget': return { symbol: '\u20AC', label: 'Budget-Friendly', gradient: 'from-emerald-500 to-green-600' };
    case 'moderate': return { symbol: '\u20AC\u20AC', label: 'Moderate', gradient: 'from-blue-500 to-indigo-600' };
    case 'upscale': return { symbol: '\u20AC\u20AC\u20AC', label: 'Upscale', gradient: 'from-purple-500 to-violet-600' };
    case 'fine_dining': return { symbol: '\u20AC\u20AC\u20AC\u20AC', label: 'Fine Dining', gradient: 'from-amber-500 to-orange-600' };
    default: return { symbol: '\u20AC\u20AC', label: 'Moderate', gradient: 'from-blue-500 to-indigo-600' };
  }
}

function renderStars(rating: number | null): React.ReactNode {
  if (rating === null) return null;

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="inline-flex items-center gap-1.5 bg-amber-50 rounded-lg px-3 py-1" aria-label={`Rating: ${Number(rating).toFixed(1)} out of 5 stars`}>
      <span className="text-lg font-bold text-amber-700">{Number(rating).toFixed(1)}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalf && (
          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id="halfStarDetail">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#halfStarDetail)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

export function RestaurantContent({ restaurant }: RestaurantContentProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Track page view
  useEffect(() => {
    apiClient.post('/analytics/pageview', { path: `/dining/${restaurant.slug}` }).catch(() => {});
  }, [restaurant.slug]);

  return (
    <div>
      {/* Hero Image / Gallery */}
      <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-orange-100 to-orange-300">
        {(restaurant.images.length > 0 && restaurant.images[activeImageIndex]) ? (
          <Image
            key={activeImageIndex}
            src={restaurant.images[activeImageIndex].url}
            alt={restaurant.images[activeImageIndex].caption || restaurant.name}
            fill
            className="object-cover animate-fade-in"
            sizes="100vw"
            priority={activeImageIndex === 0}
          />
        ) : restaurant.featuredImage ? (
          <Image
            src={restaurant.featuredImage}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Image Thumbnails (when gallery images exist) */}
      {restaurant.images.length > 0 && (
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {restaurant.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ease-in-out ${
                  activeImageIndex === idx
                    ? 'border-[3px] border-primary-500 ring-2 ring-primary-300 scale-110 shadow-lg'
                    : 'border-2 border-white/80 hover:border-primary-300 hover:scale-105 shadow-md'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || `Photo ${idx + 1}`}
                  width={80}
                  height={80}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    activeImageIndex === idx ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="py-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dining', href: '/dining' },
              ...(restaurant.cuisines.length > 0 ? [{ label: restaurant.cuisines[0], href: buildDiningCuisineUrl(restaurant.cuisineSlugs[0]) }] : []),
              { label: restaurant.name },
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Restaurant Header */}
          <header className="mb-8">
            {/* Cuisine Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisines.map((cuisine) => (
                <span
                  key={cuisine}
                  className="inline-block px-4 py-1.5 bg-orange-50 text-orange-700 text-sm font-semibold rounded-full border border-orange-200 hover:bg-orange-100 transition-colors cursor-default"
                >
                  {cuisine}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {restaurant.name}
            </h1>

            {/* Rating & Price */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {renderStars(restaurant.rating)}
              {(() => {
                const price = priceRangeInfo(restaurant.priceRange);
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${price.gradient} text-white text-sm font-bold rounded-full shadow-sm`}>
                    <span>{price.symbol}</span>
                    <span className="text-white/90 font-medium">{price.label}</span>
                  </span>
                );
              })()}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl mb-6">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Address</p>
                  <p className="text-sm text-gray-600">{restaurant.address}</p>
                  {restaurant.district && (
                    <p className="text-sm text-gray-500">{restaurant.district}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              {restaurant.phone && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1.5">Phone</p>
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-full border border-primary-200 hover:bg-primary-100 hover:border-primary-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {restaurant.website && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1.5">Website</p>
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-full border border-primary-200 hover:bg-primary-100 hover:border-primary-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                      </svg>
                      Visit Website
                    </a>
                  </div>
                </div>
              )}

              {/* Bookmark */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <BookmarkButton articleId={restaurant.id} />
                </div>
              </div>
            </div>
          </header>

          {/* Opening Hours */}
          {Object.keys(restaurant.openingHours).length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Opening Hours</h2>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(restaurant.openingHours).map(([day, hours]) => {
                      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                      const isToday = day === today;
                      const isClosed = hours === 'Closed';
                      return (
                        <tr
                          key={day}
                          className={`border-b border-gray-200 last:border-0 ${
                            isToday ? 'bg-primary-50 font-semibold' : ''
                          }`}
                        >
                          <td className={`px-6 py-3.5 text-sm font-medium ${isToday ? 'text-primary-700' : 'text-gray-900'}`}>
                            <div className="flex items-center gap-2">
                              {day}
                              {isToday && (
                                <>
                                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                    Today
                                  </span>
                                  <span className={`inline-block w-2 h-2 rounded-full ${isClosed ? 'bg-red-500' : 'bg-green-500'} ring-2 ${isClosed ? 'ring-red-200' : 'ring-green-200'}`} aria-label={isClosed ? 'Closed now' : 'Open now'} />
                                </>
                              )}
                            </div>
                          </td>
                          <td className={`px-6 py-3.5 text-sm text-right ${
                            isClosed
                              ? 'text-red-500 font-medium'
                              : isToday ? 'text-primary-600 font-semibold' : 'text-gray-600'
                          }`}>
                            {hours}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <div
              className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600 hover:prose-a:text-primary-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(restaurant.description) }}
            />
          </section>

          {/* Current Offers */}
          {restaurant.offers.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Offers</h2>
              <div className="space-y-4">
                {restaurant.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="relative p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl border-2 border-orange-200 shadow-sm overflow-hidden"
                  >
                    {/* Decorative accent stripe */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-amber-500 rounded-l-xl" />
                    <div className="flex items-start justify-between gap-4 pl-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {offer.title}
                        </h3>
                        {offer.description && (
                          <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                        )}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 rounded-md border border-orange-100">
                          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          <span className="text-xs font-medium text-orange-700">
                            {new Date(offer.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' \u2013 '}
                            {new Date(offer.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                          </svg>
                          OFFER
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Map Placeholder */}
          <section className="mb-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 h-64 flex items-center justify-center relative">
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-3 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-1">Map view coming soon</p>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {restaurant.address}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
