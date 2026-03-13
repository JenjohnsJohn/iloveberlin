import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Berlin News & Stories',
  description:
    'Stay informed with the latest news, stories, and happenings from Berlin. Coverage of arts, culture, technology, sports, and community.',
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
