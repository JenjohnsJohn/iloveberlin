import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Berlin Videos',
  description:
    'Watch video series exploring Berlin life, food, culture, and the people who make this city unique.',
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
