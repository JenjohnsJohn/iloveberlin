'use client';

import { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

const footerLinks = {
  platform: [
    { label: 'News', href: '/news' },
    { label: 'Events', href: '/events' },
    { label: 'Dining', href: '/dining' },
    { label: 'Guide', href: '/guide' },
    { label: 'Videos', href: '/videos' },
  ],
  community: [
    { label: 'Competitions', href: '/competitions' },
    { label: 'Classifieds', href: '/classifieds' },
    { label: 'Store', href: '/store' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Impressum', href: '/imprint' },
  ],
};

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      await apiClient.post('/notifications/newsletter/subscribe', { email });
      setStatus('success');
      setMessage('Thanks for subscribing! Please check your email to confirm.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-800">
      <div className="max-w-md mx-auto text-center">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
          Newsletter
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Stay up to date with the latest Berlin news, events, and tips.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 btn-gradient text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-2 text-sm text-green-400">{message}</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-sm text-red-400">{message}</p>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <Link href="/" className="text-xl font-heading font-bold text-primary-400">
              I<span className="text-red-400">♥</span>Berlin
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              Your digital guide to Berlin life.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <NewsletterSignup />

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ILOVEBERLIN. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
