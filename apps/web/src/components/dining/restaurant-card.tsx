import Link from 'next/link';
import { buildRestaurantUrl } from '@/lib/dining-seo-utils';

export interface RestaurantCardData {
  slug: string;
  name: string;
  description: string;
  featuredImage: string | null;
  cuisines: string[];
  primaryCuisineSlug: string | null;
  priceRange: 'budget' | 'moderate' | 'upscale' | 'fine_dining';
  rating: number | null;
  district: string | null;
}

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
}

function priceRangeLabel(range: string): string {
  switch (range) {
    case 'budget':
      return '$';
    case 'moderate':
      return '$$';
    case 'upscale':
      return '$$$';
    case 'fine_dining':
      return '$$$$';
    default:
      return '$$';
  }
}

function priceRangeColor(range: string): string {
  switch (range) {
    case 'budget':
      return 'bg-green-100 text-green-700';
    case 'moderate':
      return 'bg-blue-100 text-blue-700';
    case 'upscale':
      return 'bg-purple-100 text-purple-700';
    case 'fine_dining':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function renderStars(rating: number | null): React.ReactNode {
  if (rating === null) return null;

  return (
    <div className="flex items-center gap-1">
      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-sm font-semibold text-gray-800">{Number(rating).toFixed(1)}</span>
      <span className="text-xs text-gray-400">/ 5</span>
    </div>
  );
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      href={buildRestaurantUrl(restaurant.slug, restaurant.primaryCuisineSlug)}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {restaurant.featuredImage ? (
          <img
            src={restaurant.featuredImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <svg
              className="w-12 h-12 text-orange-400"
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
        {/* Price range badge */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full ${priceRangeColor(restaurant.priceRange)}`}
        >
          {priceRangeLabel(restaurant.priceRange)}
        </span>
        {/* Hover explore overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none">
          <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
            Explore
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
          {restaurant.name}
        </h3>

        {/* Cuisine tags */}
        {restaurant.cuisines.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-2">
            {restaurant.cuisines.slice(0, 3).map((cuisine) => (
              <span
                key={cuisine}
                className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[11px] font-medium rounded-full border border-orange-100"
              >
                {cuisine}
              </span>
            ))}
            {restaurant.cuisines.length > 3 && (
              <span className="text-[11px] text-gray-400 font-medium">+{restaurant.cuisines.length - 3}</span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="mb-2">{renderStars(restaurant.rating)}</div>

        {/* District */}
        {restaurant.district && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{restaurant.district}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
