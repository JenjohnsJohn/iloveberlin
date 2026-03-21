'use client';

import { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import type { CategoryFieldDefinition } from '@/types/category-fields';
import { formatDate } from '@/lib/format-date';
import { DynamicFieldDisplay } from '@/components/classifieds/dynamic-field-display';

export interface ClassifiedDetailData {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  priceType: string;
  condition: string | null;
  description: string;
  location: string | null;
  district: string | null;
  categorySlug: string;
  categoryName: string;
  categoryFields?: Record<string, unknown>;
  categoryFieldSchema?: CategoryFieldDefinition[];
  images: { id: string; url: string | null; alt: string }[];
  sellerName: string;
  sellerMemberSince: string | null;
  createdAt: string;
  views: number;
}

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'on_request') return 'Price on request';
  if (price === null) return 'Price on request';
  return `\u20AC${price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatCondition(condition: string | null): string | null {
  if (!condition) return null;
  const map: Record<string, string> = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };
  return map[condition] || condition;
}

function conditionColor(condition: string | null): string {
  if (!condition) return 'bg-gray-100 text-gray-600';
  const map: Record<string, string> = {
    new: 'bg-green-100 text-green-700',
    like_new: 'bg-teal-100 text-teal-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-amber-100 text-amber-700',
    poor: 'bg-gray-100 text-gray-700',
  };
  return map[condition] || 'bg-gray-100 text-gray-600';
}

function priceTypeBadge(priceType: string): { label: string; color: string } | null {
  const map: Record<string, { label: string; color: string }> = {
    negotiable: { label: 'Negotiable', color: 'bg-blue-100 text-blue-700' },
  };
  return map[priceType] || null;
}

interface Props {
  listing: ClassifiedDetailData;
  categorySlug: string;
  categoryName: string;
}

export function ClassifiedDetailContent({ listing, categorySlug, categoryName }: Props) {
  const [currentImage, setCurrentImage] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const images = listing.images.length > 0
    ? listing.images
    : [{ id: 'placeholder', url: null, alt: listing.title }];
  const badge = priceTypeBadge(listing.priceType);

  const switchImage = (nextIndex: number) => {
    if (nextIndex === currentImage) return;
    setFadeIn(false);
    setTimeout(() => {
      setCurrentImage(nextIndex);
      setFadeIn(true);
    }, 200);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link href="/classifieds" className="hover:text-primary-600">Classifieds</Link>
        <span>/</span>
        <Link href={`/classifieds/${categorySlug}`} className="hover:text-primary-600">{categoryName}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200">
              <div className={`w-full h-full flex items-center justify-center transition-opacity duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                {images[currentImage]?.url ? (
                  <img src={images[currentImage].url!} alt={images[currentImage].alt} className="w-full h-full object-cover cursor-zoom-in" />
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img" aria-label="No image"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                    <p className="text-sm text-gray-400">{images[currentImage].alt}</p>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={() => switchImage(currentImage === 0 ? images.length - 1 : currentImage - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105" aria-label="Previous image">
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button onClick={() => switchImage(currentImage === images.length - 1 ? 0 : currentImage + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105" aria-label="Next image">
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">{currentImage + 1} / {images.length}</div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => switchImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-200 ${currentImage === idx ? 'ring-2 ring-primary-500 scale-105 shadow-md' : 'ring-1 ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100'}`}
                  >
                    {img.url ? (
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title, Price, Badges */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {listing.condition && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${conditionColor(listing.condition)}`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      {formatCondition(listing.condition)}
                    </span>
                  )}
                  {badge && <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.label}</span>}
                </div>
              </div>
              <div className="text-right">
                {listing.priceType === 'free' ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xl font-bold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                    FREE
                  </span>
                ) : listing.priceType === 'on_request' || listing.price === null ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 btn-gradient rounded-xl text-sm font-semibold cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                    Request Price
                  </span>
                ) : (
                  <div className="bg-primary-50 rounded-xl px-4 py-2">
                    <div className="text-3xl font-bold text-primary-700">{formatPrice(listing.price, listing.priceType)}</div>
                    {listing.priceType === 'negotiable' && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                        Negotiable
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
              {listing.location && (
                <div className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{listing.location}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                <span>Posted {formatDate(listing.createdAt)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>{listing.views} views</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Category-specific fields */}
          {listing.categoryFieldSchema && listing.categoryFieldSchema.length > 0 && listing.categoryFields && Object.keys(listing.categoryFields).length > 0 && (
            <DynamicFieldDisplay
              fieldSchema={listing.categoryFieldSchema}
              values={listing.categoryFields}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Seller Card */}
          <div className="bg-gradient-to-br from-white to-primary-50/30 rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-primary-400 via-pink-500 to-primary-600">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                    {listing.sellerName.charAt(0)}
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{listing.sellerName}</p>
                {listing.sellerMemberSince && (
                  <p className="inline-flex items-center gap-1 text-sm text-gray-500">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                    Member since {formatDate(listing.sellerMemberSince)}
                  </p>
                )}
              </div>
            </div>
            {contactSent ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                Message sent! View your conversations in{' '}
                <Link href="/classifieds/messages" className="font-medium underline">Messages</Link>.
              </div>
            ) : showContactForm ? (
              <div className="space-y-3">
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={`Hi, I'm interested in "${listing.title}"...`}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
                {contactError && (
                  <p className="text-xs text-red-600">{contactError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!contactMessage.trim()) return;
                      setContactSending(true);
                      setContactError(null);
                      try {
                        await apiClient.post(`/classifieds/${listing.id}/messages`, {
                          message: contactMessage.trim(),
                        });
                        setContactSent(true);
                      } catch (err: unknown) {
                        setContactError(err instanceof Error ? err.message : 'Failed to send message. Please log in first.');
                      } finally {
                        setContactSending(false);
                      }
                    }}
                    disabled={!contactMessage.trim() || contactSending}
                    className="flex-1 px-4 py-2.5 btn-gradient rounded-lg font-medium text-sm disabled:opacity-50"
                  >
                    {contactSending ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    onClick={() => { setShowContactForm(false); setContactMessage(''); setContactError(null); }}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full px-4 py-3 btn-gradient rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                Contact Seller
              </button>
            )}
          </div>

          {/* Location Card */}
          {listing.location && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
              <div className="flex items-start gap-2 text-gray-600 mb-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <div>
                  <p className="font-medium">{listing.location}</p>
                  {listing.district && <p className="text-sm text-gray-500">District: {listing.district}</p>}
                </div>
              </div>
              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-sm text-gray-400">Map placeholder</span>
              </div>
            </div>
          )}

          {/* Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
            Report this listing
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Report listing">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {reportSubmitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
                <p className="text-sm text-gray-500 mb-4">Thank you. Our team will review this listing.</p>
                <button onClick={() => { setShowReportModal(false); setReportSubmitted(false); setReportReason(''); }} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">Close</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Report Listing</h3>
                <p className="text-sm text-gray-500 mb-4">Please tell us why you are reporting this listing.</p>
                <label htmlFor="report-reason" className="sr-only">Report reason</label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
                >
                  <option value="">Select a reason...</option>
                  <option value="spam">Spam or misleading</option>
                  <option value="prohibited">Prohibited item</option>
                  <option value="fraud">Suspected scam</option>
                  <option value="offensive">Offensive content</option>
                  <option value="other">Other</option>
                </select>
                {reportError && (
                  <p className="text-xs text-red-600 mb-3">{reportError}</p>
                )}
                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setShowReportModal(false); setReportError(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
                  <button
                    onClick={async () => {
                      try {
                        setReportError(null);
                        await apiClient.post(`/classifieds/${listing.id}/report`, { reason: reportReason });
                        setReportSubmitted(true);
                      } catch (err: unknown) {
                        setReportError(err instanceof Error ? err.message : 'Failed to submit report. Please log in first.');
                      }
                    }}
                    disabled={!reportReason}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
