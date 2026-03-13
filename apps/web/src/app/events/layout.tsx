import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events in Berlin',
  description:
    'Discover the best events happening in Berlin. From art exhibitions and concerts to nightlife and community gatherings.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
