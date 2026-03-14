'use client';

import Link from 'next/link';
import type { NavSection } from '@/lib/nav-config';
import type { CategoryCardData } from '@/components/ui/category-grid';

interface MegaDropdownPanelProps {
  section: NavSection;
  categories: CategoryCardData[];
  isLoading: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
}

function CategoryIcon({ icon }: { icon: string | null | undefined }) {
  // Simplified inline icon — reuses the same SVG approach as category-grid
  const props = {
    className: 'w-4 h-4 shrink-0',
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.5,
  };

  if (!icon) {
    return (
      <svg {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
      />
    </svg>
  );
}

function SkeletonLoader() {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function buildHref(basePath: string, slug: string, slugTransform?: (s: string) => string) {
  return `${basePath}/${slugTransform ? slugTransform(slug) : slug}`;
}

export function MegaDropdownPanel({
  section,
  categories,
  isLoading,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: MegaDropdownPanelProps) {
  return (
    <div
      className="absolute left-0 right-0 top-full z-50 animate-dropdown-in"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-b-xl shadow-xl overflow-hidden">
          {/* Explore all link */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-100">
            <Link
              href={section.href}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              onClick={onNavigate}
            >
              Explore All {section.label} &rarr;
            </Link>
          </div>

          {isLoading ? (
            <SkeletonLoader />
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              <Link
                href={section.href}
                className="text-primary-600 hover:text-primary-700"
                onClick={onNavigate}
              >
                Explore {section.label} &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 p-6 max-h-[60vh] overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.slug}>
                  <Link
                    href={buildHref(section.categoryBasePath, cat.slug, section.slugTransform)}
                    className="group flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-primary-600 transition-colors"
                    onClick={onNavigate}
                  >
                    <span className="text-gray-400 group-hover:text-primary-500 transition-colors">
                      <CategoryIcon icon={cat.icon} />
                    </span>
                    {cat.name}
                  </Link>
                  {cat.children && cat.children.length > 0 && (
                    <ul className="mt-1 ml-5.5 space-y-0.5">
                      {cat.children.map((child) => (
                        <li key={child.slug}>
                          <Link
                            href={buildHref(
                              section.categoryBasePath,
                              child.slug,
                              section.slugTransform,
                            )}
                            className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                            onClick={onNavigate}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
