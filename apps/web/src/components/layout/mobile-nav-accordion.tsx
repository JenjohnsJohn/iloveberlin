'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_SECTIONS } from '@/lib/nav-config';
import { useNavCategories } from '@/hooks/use-nav-categories';
import type { NavSection } from '@/lib/nav-config';

interface MobileNavAccordionProps {
  onNavigate: () => void;
}

/** Section icons matching the homepage grid icons */
const SECTION_ICONS: Record<string, React.ReactNode> = {
  news: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  events: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  dining: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  guide: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  videos: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  competitions: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  classifieds: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  store: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
};

/** Section accent colors for the mobile nav */
const SECTION_COLORS: Record<string, { iconBg: string; iconText: string; activeBg: string }> = {
  news: { iconBg: 'bg-orange-100', iconText: 'text-orange-500', activeBg: 'bg-orange-50' },
  events: { iconBg: 'bg-rose-100', iconText: 'text-rose-500', activeBg: 'bg-rose-50' },
  dining: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-500', activeBg: 'bg-emerald-50' },
  guide: { iconBg: 'bg-sky-100', iconText: 'text-sky-500', activeBg: 'bg-sky-50' },
  videos: { iconBg: 'bg-violet-100', iconText: 'text-violet-500', activeBg: 'bg-violet-50' },
  competitions: { iconBg: 'bg-amber-100', iconText: 'text-amber-500', activeBg: 'bg-amber-50' },
  classifieds: { iconBg: 'bg-teal-100', iconText: 'text-teal-500', activeBg: 'bg-teal-50' },
  store: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-500', activeBg: 'bg-indigo-50' },
};

const DEFAULT_SECTION_COLORS = { iconBg: 'bg-gray-100', iconText: 'text-gray-500', activeBg: 'bg-gray-50' };

function AccordionItem({
  section,
  isOpen,
  onToggle,
  onNavigate,
}: {
  section: NavSection;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const { categories, isLoading } = useNavCategories(isOpen ? section.key : null);
  const pathname = usePathname();
  const isActive = pathname.startsWith(section.href);
  const colors = SECTION_COLORS[section.key] || DEFAULT_SECTION_COLORS;
  const icon = SECTION_ICONS[section.key];

  return (
    <div className={`border-b border-gray-100 last:border-b-0 transition-colors duration-200 ${isOpen ? colors.activeBg : ''}`}>
      <div className="flex items-center gap-3 px-2">
        {/* Section icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${isOpen ? colors.iconBg : 'bg-gray-50'} ${isOpen ? colors.iconText : 'text-gray-400'}`}>
          {icon || (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          )}
        </div>

        {/* Section label link */}
        <Link
          href={section.href}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            isActive ? 'text-primary-600' : 'text-gray-800 hover:text-primary-600'
          }`}
          onClick={onNavigate}
        >
          {section.label}
          {isActive && (
            <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary-500" />
          )}
        </Link>

        {/* Toggle button */}
        <button
          type="button"
          className={`p-2 rounded-lg transition-all duration-200 ${
            isOpen
              ? `${colors.iconText} ${colors.iconBg}`
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${section.label} categories`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Accordion content with smooth height transition */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-3 pl-[3.25rem] pr-4">
            {/* View all link */}
            <Link
              href={section.href}
              className="inline-flex items-center gap-1 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              onClick={onNavigate}
            >
              View All {section.label}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            {isLoading ? (
              <div className="space-y-2 mt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-white/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="mt-1 space-y-0.5">
                {categories.map((cat) => {
                  const catHref = `${section.categoryBasePath}/${
                    section.slugTransform ? section.slugTransform(cat.slug) : cat.slug
                  }`;
                  const isCatActive = pathname.startsWith(catHref);

                  return (
                    <li key={cat.slug}>
                      <Link
                        href={catHref}
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
                          isCatActive
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }`}
                        onClick={onNavigate}
                      >
                        {isCatActive && (
                          <span className="w-1 h-1 rounded-full bg-primary-500 shrink-0" />
                        )}
                        <span className={isCatActive ? '' : 'ml-3'}>{cat.name}</span>
                        {cat.listing_count != null && cat.listing_count > 0 && (
                          <span className="ml-auto text-xs text-gray-400">{cat.listing_count}</span>
                        )}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <ul className="ml-6 space-y-0.5">
                          {cat.children.map((child) => {
                            const childHref = `${section.categoryBasePath}/${
                              section.slugTransform
                                ? section.slugTransform(child.slug)
                                : child.slug
                            }`;
                            const isChildActive = pathname === childHref;

                            return (
                              <li key={child.slug}>
                                <Link
                                  href={childHref}
                                  className={`block py-1.5 px-3 rounded text-xs transition-colors ${
                                    isChildActive
                                      ? 'text-primary-600 font-medium'
                                      : 'text-gray-400 hover:text-gray-700 hover:bg-white/80'
                                  }`}
                                  onClick={onNavigate}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileNavAccordion({ onNavigate }: MobileNavAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="divide-y divide-gray-100">
      {NAV_SECTIONS.map((section) => (
        <AccordionItem
          key={section.key}
          section={section}
          isOpen={openSection === section.key}
          onToggle={() =>
            setOpenSection((prev) => (prev === section.key ? null : section.key))
          }
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
