export const FALLBACK_CATEGORY_SLUG = 'general';

export function toCategorySeoSlug(slug: string): string {
  return `berlin-${slug}-news`;
}

export function fromCategorySeoSlug(seoSlug: string): string | null {
  const match = seoSlug.match(/^berlin-(.+)-news$/);
  return match ? match[1] : null;
}

export function buildArticleUrl(articleSlug: string, categorySlug?: string | null): string {
  return `/news/${toCategorySeoSlug(categorySlug || FALLBACK_CATEGORY_SLUG)}/${articleSlug}`;
}

export function buildCategoryUrl(categorySlug: string): string {
  return `/news/${toCategorySeoSlug(categorySlug)}`;
}
