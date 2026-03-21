'use client';

import { useEffect, useRef, useCallback } from 'react';

type AdPosition =
  | 'homepage_banner'
  | 'sidebar'
  | 'article_inline'
  | 'category_header'
  | 'footer';

interface AdBannerProps {
  position: AdPosition;
  className?: string;
}

const POSITION_SIZES: Record<AdPosition, { width: string; height: string }> = {
  homepage_banner: { width: 'w-full', height: 'h-24 md:h-32' },
  sidebar: { width: 'w-full', height: 'h-64' },
  article_inline: { width: 'w-full', height: 'h-20 md:h-24' },
  category_header: { width: 'w-full', height: 'h-20 md:h-28' },
  footer: { width: 'w-full', height: 'h-16 md:h-20' },
};

const POSITION_LABELS: Record<AdPosition, string> = {
  homepage_banner: 'Homepage Banner',
  sidebar: 'Sidebar',
  article_inline: 'Article Inline',
  category_header: 'Category Header',
  footer: 'Footer',
};

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);

  const trackImpression = useCallback(() => {
    if (hasTrackedImpression.current) return;
    hasTrackedImpression.current = true;
    // Stub: In production, this would call POST /api/ads/:placementId/impression
  }, []);

  useEffect(() => {
    const element = bannerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackImpression();
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [trackImpression]);

  const sizes = POSITION_SIZES[position];

  return (
    <div className={`relative ${className}`}>
      {/* Sponsored label */}
      <div className="flex items-center justify-center mb-1.5">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          Sponsored
        </span>
      </div>
      {/* Ad container */}
      <div
        ref={bannerRef}
        className={`${sizes.width} ${sizes.height} bg-gray-50 border border-gray-100 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300`}
      >
        <span className="text-xs text-gray-300 mt-1">
          {POSITION_LABELS[position]}
        </span>
      </div>
    </div>
  );
}
