import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restaurants & Dining in Berlin',
  description:
    'Discover the best restaurants, cafes, and eateries Berlin has to offer. From street food to fine dining, explore the city\'s vibrant culinary scene.',
};

export default function DiningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
