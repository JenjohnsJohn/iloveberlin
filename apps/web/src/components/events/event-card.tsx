import Link from 'next/link';
import { buildEventUrl } from '@/lib/events-seo-utils';

export interface EventCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: string;
  categorySlug: string;
  venueName: string | null;
  startDate: string;
  startTime: string | null;
  endTime: string | null;
  isFree: boolean;
  price: number | null;
  priceMax: number | null;
}

interface EventCardProps {
  event: EventCardData;
}

function formatDateOverlay(dateStr: string): { day: string; month: string } {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate().toString();
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return { day, month };
}

function formatTime(time: string | null): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${suffix}`;
}

function formatPrice(isFree: boolean, price: number | null, priceMax: number | null): string {
  if (isFree) return 'Free';
  if (price && priceMax && priceMax > price) {
    return `\u20AC${Number(price).toFixed(0)}\u2013\u20AC${Number(priceMax).toFixed(0)}`;
  }
  if (price) return `\u20AC${Number(price).toFixed(2)}`;
  return 'Free';
}

export function EventCard({ event }: EventCardProps) {
  const { day, month } = formatDateOverlay(event.startDate);
  const priceText = formatPrice(event.isFree, event.price, event.priceMax);

  return (
    <Link
      href={buildEventUrl(event.slug, event.categorySlug)}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-primary-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image with date overlay */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {event.featuredImage ? (
          <img
            src={event.featuredImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <svg
              className="w-12 h-12 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Date overlay */}
        <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 text-center shadow-sm min-w-[48px]">
          <div className="text-lg font-bold text-gray-900 leading-tight">{day}</div>
          <div className="text-[10px] font-semibold text-primary-600 uppercase leading-tight">{month}</div>
        </div>
        {/* Category badge */}
        <span className="absolute top-3 right-3 px-2.5 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
          {event.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
          {event.title}
        </h3>

        {/* Venue */}
        {event.venueName && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.venueName}</span>
          </div>
        )}

        {/* Time */}
        {event.startTime && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {formatTime(event.startTime)}
              {event.endTime ? ` \u2013 ${formatTime(event.endTime)}` : ''}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              event.isFree
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {priceText}
          </span>
        </div>
      </div>
    </Link>
  );
}
