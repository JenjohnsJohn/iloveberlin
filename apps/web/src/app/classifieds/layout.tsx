import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classifieds in Berlin',
  description:
    'Buy, sell, and discover goods and services in Berlin. From apartments and vehicles to electronics and jobs.',
};

export default function ClassifiedsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
