'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface DiningOfferData {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  restaurant: {
    slug: string;
    name: string;
    featuredImage: string | null;
    cuisines: string[];
    district: string | null;
    priceRange: string;
  };
}

function mapOffer(raw: Record<string, unknown>): DiningOfferData {
  const restaurant = raw.restaurant as Record<string, unknown> | null;
  const cuisines = restaurant?.cuisines as Record<string, unknown>[] | undefined;
  const featuredImage = restaurant?.featured_image as Record<string, unknown> | null;

  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    description: (raw.description as string) || null,
    startDate: String(raw.start_date || raw.startDate || ''),
    endDate: String(raw.end_date || raw.endDate || ''),
    restaurant: {
      slug: String(restaurant?.slug || ''),
      name: String(restaurant?.name || ''),
      featuredImage: (featuredImage?.url as string) || (restaurant?.featuredImage as string) || null,
      cuisines: Array.isArray(cuisines) ? cuisines.map((c) => String(c.name || c)) : [],
      district: (restaurant?.district as string) || null,
      priceRange: String(restaurant?.price_range || restaurant?.priceRange || 'moderate'),
    },
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysRemaining(endDateStr: string): number {
  const endDate = new Date(endDateStr + 'T23:59:59');
  const today = new Date();
  const diffMs = endDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function DiningOffersPage() {
  const [offers, setOffers] = useState<DiningOfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await apiClient.get('/dining/offers');
        const items = Array.isArray(data) ? data : data.data ?? [];
        setOffers(items.map((o: Record<string, unknown>) => mapOffer(o)));
      } catch {
        setError('Failed to load dining offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Dining Offers
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the latest dining deals, special menus, and exclusive offers
          from Berlin&apos;s best restaurants.
        </p>
      </section>

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <section className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 bg-gray-200" />
                  <div className="flex-1 p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : !error && offers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No dining offers available right now.</p>
          <p className="text-gray-400 text-sm mt-2">Check back soon for new deals!</p>
        </div>
      ) : (
        /* Offers List */
        <section className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {offers.map((offer) => {
              const remaining = daysRemaining(offer.endDate);
              const isEndingSoon = remaining <= 7;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Restaurant Image */}
                    <div className="md:w-48 flex-shrink-0">
                      <Link href={`/dining/${offer.restaurant.slug}`}>
                        <div className="h-48 md:h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          {offer.restaurant.featuredImage ? (
                            <img
                              src={offer.restaurant.featuredImage}
                              alt={offer.restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg
                              className="w-10 h-10 text-orange-400"
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
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Offer Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                          OFFER
                        </span>
                        {isEndingSoon && remaining > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Ends in {remaining} day{remaining !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {offer.title}
                      </h3>

                      <Link
                        href={`/dining/${offer.restaurant.slug}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-3 inline-block"
                      >
                        {offer.restaurant.name}
                        {offer.restaurant.district && ` - ${offer.restaurant.district}`}
                      </Link>

                      {offer.description && (
                        <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                        </span>
                        <div className="flex gap-1.5">
                          {offer.restaurant.cuisines.map((c) => (
                            <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Back to Dining */}
      <div className="text-center mt-10">
        <Link
          href="/dining"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to All Restaurants
        </Link>
      </div>
    </div>
  );
}
