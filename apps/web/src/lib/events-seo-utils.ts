export const FALLBACK_EVENT_CATEGORY_SLUG = 'general';

export function toEventCategorySeoSlug(slug: string): string {
  return `berlin-${slug}-events`;
}

export function fromEventCategorySeoSlug(seoSlug: string): string | null {
  const match = seoSlug.match(/^berlin-(.+)-events$/);
  return match ? match[1] : null;
}

export function buildEventUrl(eventSlug: string, categorySlug?: string | null): string {
  return `/events/${toEventCategorySeoSlug(categorySlug || FALLBACK_EVENT_CATEGORY_SLUG)}/${eventSlug}`;
}

export function buildEventCategoryUrl(categorySlug: string): string {
  return `/events/${toEventCategorySeoSlug(categorySlug)}`;
}
