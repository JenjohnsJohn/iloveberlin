export const FALLBACK_DINING_CUISINE_SLUG = 'general';

export function toDiningCuisineSeoSlug(slug: string): string {
  return `berlin-${slug}-dining`;
}

export function fromDiningCuisineSeoSlug(seoSlug: string): string | null {
  const match = seoSlug.match(/^berlin-(.+)-dining$/);
  return match ? match[1] : null;
}

export function buildRestaurantUrl(restaurantSlug: string, cuisineSlug?: string | null): string {
  return `/dining/${toDiningCuisineSeoSlug(cuisineSlug || FALLBACK_DINING_CUISINE_SLUG)}/${restaurantSlug}`;
}

export function buildDiningCuisineUrl(cuisineSlug: string): string {
  return `/dining/${toDiningCuisineSeoSlug(cuisineSlug)}`;
}
