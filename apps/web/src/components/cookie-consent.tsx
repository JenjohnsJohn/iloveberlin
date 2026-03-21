'use client';

import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'iloveberlin-cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up-bottom">
      <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white/90 backdrop-blur-lg border border-white/20 shadow-xl px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Cookie icon */}
              <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">
                <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-.347-.018-.69-.053-1.027a1 1 0 0 0-1.18-.876 2.5 2.5 0 0 1-2.953-1.63 1 1 0 0 0-1.093-.653 3 3 0 0 1-3.328-2.147 1 1 0 0 0-.924-.718A3.5 3.5 0 0 1 9.5 2.051 1 1 0 0 0 8.615 2H12Zm-4 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm2 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                </svg>
              </span>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use cookies to improve your experience on our platform. By continuing to browse,
                you agree to our use of cookies. Learn more in our{' '}
                <a href="/privacy" className="text-primary-600 font-medium underline underline-offset-2 hover:text-primary-700 transition-colors">
                  Privacy Policy
                </a>.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="btn-gradient rounded-lg px-5 py-2 text-sm font-semibold"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
