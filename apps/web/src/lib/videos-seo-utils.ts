export const FALLBACK_VIDEO_CATEGORY_SLUG = 'general';

export function toVideoCategorySeoSlug(slug: string): string {
  return `berlin-${slug}-videos`;
}

export function fromVideoCategorySeoSlug(seoSlug: string): string | null {
  const match = seoSlug.match(/^berlin-(.+)-videos$/);
  return match ? match[1] : null;
}

export function buildVideoUrl(videoSlug: string, categorySlug?: string | null): string {
  return `/videos/${toVideoCategorySeoSlug(categorySlug || FALLBACK_VIDEO_CATEGORY_SLUG)}/${videoSlug}`;
}

export function buildVideoCategoryUrl(categorySlug: string): string {
  return `/videos/${toVideoCategorySeoSlug(categorySlug)}`;
}
