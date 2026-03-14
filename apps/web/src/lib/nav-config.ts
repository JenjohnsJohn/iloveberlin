import { toCategorySeoSlug } from './news-seo-utils';
import { toEventCategorySeoSlug } from './events-seo-utils';
import { toDiningCuisineSeoSlug } from './dining-seo-utils';
import { toGuideTopicSeoSlug } from './guide-seo-utils';
import { toVideoCategorySeoSlug } from './videos-seo-utils';
import { toCompetitionCategorySeoSlug } from './competitions-seo-utils';

export interface NavSection {
  key: string;
  label: string;
  href: string;
  apiEndpoint: string;
  categoryBasePath: string;
  slugTransform?: (slug: string) => string;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    key: 'news',
    label: 'News',
    href: '/news',
    apiEndpoint: '/categories/tree?type=article',
    categoryBasePath: '/news',
    slugTransform: toCategorySeoSlug,
  },
  {
    key: 'events',
    label: 'Events',
    href: '/events',
    apiEndpoint: '/categories/tree?type=event',
    categoryBasePath: '/events',
    slugTransform: toEventCategorySeoSlug,
  },
  {
    key: 'dining',
    label: 'Dining',
    href: '/dining',
    apiEndpoint: '/dining/cuisines/tree',
    categoryBasePath: '/dining',
    slugTransform: toDiningCuisineSeoSlug,
  },
  {
    key: 'guide',
    label: 'Guide',
    href: '/guide',
    apiEndpoint: '/guides/topics/tree',
    categoryBasePath: '/guide',
    slugTransform: toGuideTopicSeoSlug,
  },
  {
    key: 'videos',
    label: 'Videos',
    href: '/videos',
    apiEndpoint: '/categories/tree?type=video',
    categoryBasePath: '/videos',
    slugTransform: toVideoCategorySeoSlug,
  },
  {
    key: 'competitions',
    label: 'Competitions',
    href: '/competitions',
    apiEndpoint: '/categories/tree?type=competition',
    categoryBasePath: '/competitions',
    slugTransform: toCompetitionCategorySeoSlug,
  },
  {
    key: 'classifieds',
    label: 'Classifieds',
    href: '/classifieds',
    apiEndpoint: '/classifieds/categories',
    categoryBasePath: '/classifieds',
  },
  {
    key: 'store',
    label: 'Store',
    href: '/store',
    apiEndpoint: '/store/categories/tree',
    categoryBasePath: '/store/category',
  },
];
