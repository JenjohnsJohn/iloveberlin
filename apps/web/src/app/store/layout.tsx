import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Berlin Store - I♥Berlin',
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
    canonical: 'https://iloveberlin.biz/store',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
