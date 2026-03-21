'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [formStep, setFormStep] = useState(1);
  const termsContentRef = useRef<HTMLDivElement>(null);
  const [termsHeight, setTermsHeight] = useState(0);
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

  // Measure terms content height for smooth animation
  useEffect(() => {
    if (termsContentRef.current) {
      setTermsHeight(termsContentRef.current.scrollHeight);
    }
  }, [showTerms, competition.termsConditions]);

  const canAdvanceToStep2 = formData.name.trim() !== '' && formData.email.trim() !== '';

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

          {/* Prize section — eye-catching */}
          {competition.prizeDescription && (
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 prize-shimmer">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-0.5">
                    Prize
                  </p>
                  <p className="text-xl font-bold text-amber-900">
                    {competition.prizeDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(competition.description),
            }}
          />

          {/* Terms & Conditions — collapsible accordion */}
          {competition.termsConditions && (
            <div className="border border-gray-200 rounded-xl mb-8 overflow-hidden">
              <button
                onClick={() => setShowTerms(!showTerms)}
                aria-expanded={showTerms}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <span>Terms &amp; Conditions</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ease-in-out ${
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
              <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                  maxHeight: showTerms ? `${termsHeight + 32}px` : '0px',
                  opacity: showTerms ? 1 : 0,
                }}
              >
                <div
                  ref={termsContentRef}
                  className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4"
                >
                  {competition.termsConditions}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Countdown Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 text-center">
                {isEnded ? 'Competition Ended' : 'Time Remaining'}
              </h3>
              <CountdownTimer
                endDate={competition.endDate}
                className="mb-4"
              />
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {competition.entryCount}
                  </span>
                  <span className="text-xs text-gray-500">entries</span>
                </div>
                {competition.maxEntries && (
                  <>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {competition.maxEntries}
                      </span>
                      <span className="text-xs text-gray-500">max</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Entry Form or Confirmation */}
            {!isEnded && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
                {entrySubmitted ? (
                  <div className="text-center py-4 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 ring-4 ring-green-50">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full px-3 py-1 mb-3">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Already Entered
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Entry Submitted!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Good luck! We&apos;ll notify you if you win.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Enter Competition
                    </h3>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          formStep >= 1
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {formStep > 1 ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : '1'}
                        </div>
                        <span className="text-xs font-medium text-gray-600">Details</span>
                      </div>
                      <div className={`flex-1 h-0.5 rounded ${formStep >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          formStep >= 2
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          2
                        </div>
                        <span className="text-xs font-medium text-gray-600">Submit</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {formStep === 1 && (
                        <div className="space-y-4 animate-fade-in">
                          <div>
                            <label
                              htmlFor="entry-name"
                              className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                              Full Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              id="entry-name"
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                              placeholder="Your full name"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="entry-email"
                              className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                              Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                              id="entry-email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                              placeholder="your@email.com"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (canAdvanceToStep2) setFormStep(2);
                            }}
                            disabled={!canAdvanceToStep2}
                            className="w-full btn-gradient rounded-lg px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            Continue
                          </button>
                        </div>
                      )}
                      {formStep === 2 && (
                        <div className="space-y-4 animate-fade-in">
                          {/* Summary of step 1 */}
                          <div className="bg-gray-50 rounded-lg px-3.5 py-2.5 text-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{formData.name}</p>
                                <p className="text-gray-500 text-xs">{formData.email}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFormStep(1)}
                                className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="entry-message"
                              className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                              Message <span className="text-gray-400 font-normal">(optional)</span>
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
                              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-gray-400"
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
                            className="w-full btn-gradient rounded-lg px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Submitting...
                              </span>
                            ) : (
                              'Submit Entry'
                            )}
                          </button>
                        </div>
                      )}
                    </form>
                  </>
                )}
              </div>
            )}

            {/* Winner display for ended competitions */}
            {isEnded && competition.winnerName && (
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-xl border border-amber-200 p-6 text-center shadow-soft">
                {/* Decorative background sparkles */}
                <div className="absolute top-2 right-4 text-amber-300/40 text-2xl">&#10022;</div>
                <div className="absolute bottom-3 left-4 text-amber-300/30 text-lg">&#10022;</div>
                <div className="absolute top-8 left-8 text-amber-200/30 text-sm">&#10022;</div>

                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-4 shadow-lg ring-4 ring-amber-100">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.985 6.985 0 01-4.27 1.472 6.985 6.985 0 01-4.27-1.472"
                      />
                    </svg>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-amber-200/60 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Competition Ended
                  </div>
                  <h3 className="text-lg font-bold text-amber-900 mb-1">
                    Winner
                  </h3>
                  <p className="text-xl font-bold text-amber-800">
                    {competition.winnerName}
                  </p>
                </div>
              </div>
            )}

            {/* Ended with no winner */}
            {isEnded && !competition.winnerName && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center shadow-soft">
                <div className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
                  Competition Ended
                </div>
                <p className="text-sm text-gray-500">
                  This competition has closed. Stay tuned for new competitions!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
