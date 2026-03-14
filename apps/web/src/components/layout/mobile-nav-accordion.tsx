'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NAV_SECTIONS } from '@/lib/nav-config';
import { useNavCategories } from '@/hooks/use-nav-categories';
import type { NavSection } from '@/lib/nav-config';

interface MobileNavAccordionProps {
  onNavigate: () => void;
}

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

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        <Link
          href={section.href}
          className="flex-1 py-3 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
          onClick={onNavigate}
        >
          {section.label}
        </Link>
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${section.label} categories`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-3 pl-4">
            <Link
              href={section.href}
              className="block py-1 text-xs font-medium text-primary-600 hover:text-primary-700"
              onClick={onNavigate}
            >
              View All {section.label} &rarr;
            </Link>

            {isLoading ? (
              <div className="space-y-2 mt-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="mt-1 space-y-0.5">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`${section.categoryBasePath}/${
                        section.slugTransform ? section.slugTransform(cat.slug) : cat.slug
                      }`}
                      className="block py-1 text-xs text-gray-600 hover:text-primary-600 transition-colors"
                      onClick={onNavigate}
                    >
                      {cat.name}
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <ul className="ml-3 space-y-0.5">
                        {cat.children.map((child) => (
                          <li key={child.slug}>
                            <Link
                              href={`${section.categoryBasePath}/${
                                section.slugTransform
                                  ? section.slugTransform(child.slug)
                                  : child.slug
                              }`}
                              className="block py-0.5 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                              onClick={onNavigate}
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
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
    <div>
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
