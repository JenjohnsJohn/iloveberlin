export const FALLBACK_GUIDE_TOPIC_SLUG = 'general';

export function toGuideTopicSeoSlug(slug: string): string {
  return `berlin-${slug}-guide`;
}

export function fromGuideTopicSeoSlug(seoSlug: string): string | null {
  const match = seoSlug.match(/^berlin-(.+)-guide$/);
  return match ? match[1] : null;
}

export function buildGuideUrl(guideSlug: string, topicSlug?: string | null): string {
  return `/guide/${toGuideTopicSeoSlug(topicSlug || FALLBACK_GUIDE_TOPIC_SLUG)}/${guideSlug}`;
}

export function buildGuideTopicUrl(topicSlug: string): string {
  return `/guide/${toGuideTopicSeoSlug(topicSlug)}`;
}
