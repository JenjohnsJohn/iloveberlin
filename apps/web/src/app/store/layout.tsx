import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Berlin Store - ILOVEBERLIN',
  description:
    'Discover unique Berlin-inspired products, from apparel and art to artisan food and gifts. Take a piece of Berlin home with you.',
  openGraph: {
    title: 'Berlin Store',
    description: 'Discover unique Berlin-inspired products, from apparel and art to artisan food and gifts.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berlin Store',
  },
  alternates: {
    canonical: `${SITE_URL}/store`,
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
