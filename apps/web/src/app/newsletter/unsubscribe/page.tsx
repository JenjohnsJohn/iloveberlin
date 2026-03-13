'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const [resubscribed, setResubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResubscribe = async () => {
    setIsLoading(true);
    try {
      // Mock resubscribe - in production this would call the API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setResubscribed(true);
    } catch {
      // Handle error silently in mock
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        {resubscribed ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600 mb-6">
              You have been resubscribed to our newsletter. You will start
              receiving updates again soon.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You Have Been Unsubscribed
            </h1>
            <p className="text-gray-600 mb-6">
              You will no longer receive our newsletter emails. We are sorry to
              see you go!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleResubscribe}
                disabled={isLoading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Resubscribing...' : 'Resubscribe'}
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
