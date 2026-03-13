'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { sanitizeHtml } from '@/lib/sanitize';
import apiClient from '@/lib/api-client';

export interface CompetitionDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  prizeDescription: string | null;
  featuredImage: string | null;
  startDate: string;
  endDate: string;
  status: string;
  termsConditions: string | null;
  entryCount: number;
  maxEntries: number | null;
  winnerName: string | null;
}

interface CompetitionContentProps {
  competition: CompetitionDetail;
}

export function CompetitionContent({ competition }: CompetitionContentProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [entrySubmitted, setEntrySubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const isEnded =
    new Date(competition.endDate).getTime() < Date.now() ||
    competition.status === 'closed' ||
    competition.status === 'archived';

  // Page view tracking
  useEffect(() => {
    apiClient.post('/analytics/pageview', { path: `/competitions/${competition.slug}` }).catch(() => {});
  }, [competition.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClient.post(`/competitions/${competition.id}/enter`, {
        entry_data: {
          name: formData.name,
          email: formData.email,
          ...(formData.message ? { message: formData.message } : {}),
        },
      });
      setEntrySubmitted(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message ?? 'Failed to submit entry. Please try again.',
            )
          : 'Failed to submit entry. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            { label: competition.title },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-8">
            {competition.featuredImage ? (
              <img
                src={competition.featuredImage}
                alt={competition.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                <svg
                  className="w-20 h-20 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="Competition trophy"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.985 6.985 0 01-4.27 1.472 6.985 6.985 0 01-4.27-1.472"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {competition.title}
          </h1>

          {/* Prize badge */}
          {competition.prizeDescription && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                role="img"
                aria-label="Prize"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.985 6.985 0 01-4.27 1.472 6.985 6.985 0 01-4.27-1.472"
                />
              </svg>
              <span className="text-amber-800 font-semibold">
                Prize: {competition.prizeDescription}
              </span>
            </div>
          )}

          {/* Description */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(competition.description),
            }}
          />

          {/* Terms & Conditions */}
          {competition.termsConditions && (
            <div className="border border-gray-200 rounded-lg mb-8">
              <button
                onClick={() => setShowTerms(!showTerms)}
                aria-expanded={showTerms}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Terms &amp; Conditions</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showTerms ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showTerms && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-200 pt-3">
                  {competition.termsConditions}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Countdown Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {isEnded ? 'Competition Ended' : 'Time Remaining'}
              </h3>
              <CountdownTimer
                endDate={competition.endDate}
                className="mb-4"
              />
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="font-semibold text-gray-900">
                    {competition.entryCount}
                  </span>{' '}
                  entries
                </div>
                {competition.maxEntries && (
                  <div>
                    <span className="font-semibold text-gray-900">
                      {competition.maxEntries}
                    </span>{' '}
                    max
                  </div>
                )}
              </div>
            </div>

            {/* Entry Form or Confirmation */}
            {!isEnded && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {entrySubmitted ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                      <svg
                        className="w-6 h-6 text-green-600"
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Entry Submitted!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Good luck! We&apos;ll notify you if you win.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Enter Competition
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="entry-name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name *
                        </label>
                        <input
                          id="entry-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="entry-email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email Address *
                        </label>
                        <input
                          id="entry-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="entry-message"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Message (optional)
                        </label>
                        <textarea
                          id="entry-message"
                          rows={3}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                          placeholder="Tell us why you'd like to win..."
                        />
                      </div>
                      {submitError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* Winner display for ended competitions */}
            {isEnded && competition.winnerName && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  Winner
                </h3>
                <p className="text-green-800 font-medium">
                  {competition.winnerName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
