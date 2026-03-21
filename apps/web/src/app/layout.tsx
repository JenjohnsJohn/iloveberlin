import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { MainLayout } from '@/components/layout/main-layout';
import { CookieConsent } from '@/components/cookie-consent';
import { SITE_URL } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'ILOVEBERLIN - Your Digital Guide to Berlin Life',
    template: '%s | ILOVEBERLIN',
  },
  description:
    'Discover Berlin life - news, events, dining, guides, videos, and more. Your digital lifestyle hub for everything Berlin.',
  keywords: ['Berlin', 'Berlin events', 'Berlin restaurants', 'Berlin guide', 'Berlin news'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'ILOVEBERLIN',
    title: 'ILOVEBERLIN - Your Digital Guide to Berlin Life',
    description: 'Discover Berlin life - news, events, dining, guides, videos, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ILOVEBERLIN',
    description: 'Discover Berlin life - news, events, dining, guides, videos, and more.',
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary-600 focus:text-white">
          Skip to main content
        </a>
        <AuthProvider>
          <MainLayout>
            {children}
          </MainLayout>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
