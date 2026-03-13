import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitions & Giveaways',
  description:
    'Enter competitions for a chance to win incredible experiences and prizes in Berlin. New competitions added regularly.',
};

export default function CompetitionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
