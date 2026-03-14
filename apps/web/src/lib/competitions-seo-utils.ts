export const FALLBACK_COMPETITION_CATEGORY_SLUG = 'general';

export function toCompetitionCategorySeoSlug(slug: string): string {
  return `berlin-${slug}-competitions`;
}

export function fromCompetitionCategorySeoSlug(seoSlug: string): string | null {
  const match = seoSlug.match(/^berlin-(.+)-competitions$/);
  return match ? match[1] : null;
}

export function buildCompetitionUrl(competitionSlug: string, categorySlug?: string | null): string {
  return `/competitions/${toCompetitionCategorySeoSlug(categorySlug || FALLBACK_COMPETITION_CATEGORY_SLUG)}/${competitionSlug}`;
}

export function buildCompetitionCategoryUrl(categorySlug: string): string {
  return `/competitions/${toCompetitionCategorySeoSlug(categorySlug)}`;
}
