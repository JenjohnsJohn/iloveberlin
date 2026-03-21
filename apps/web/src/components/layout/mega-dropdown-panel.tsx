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

/** Section-specific accent colors keyed by nav section key */
const SECTION_COLORS: Record<string, { accent: string; hoverBg: string; iconColor: string }> = {
  news: { accent: 'border-t-orange-500', hoverBg: 'hover:bg-orange-50', iconColor: 'text-orange-400 group-hover:text-orange-600' },
  events: { accent: 'border-t-rose-500', hoverBg: 'hover:bg-rose-50', iconColor: 'text-rose-400 group-hover:text-rose-600' },
  dining: { accent: 'border-t-emerald-500', hoverBg: 'hover:bg-emerald-50', iconColor: 'text-emerald-400 group-hover:text-emerald-600' },
  guide: { accent: 'border-t-sky-500', hoverBg: 'hover:bg-sky-50', iconColor: 'text-sky-400 group-hover:text-sky-600' },
  videos: { accent: 'border-t-violet-500', hoverBg: 'hover:bg-violet-50', iconColor: 'text-violet-400 group-hover:text-violet-600' },
  competitions: { accent: 'border-t-amber-500', hoverBg: 'hover:bg-amber-50', iconColor: 'text-amber-400 group-hover:text-amber-600' },
  classifieds: { accent: 'border-t-teal-500', hoverBg: 'hover:bg-teal-50', iconColor: 'text-teal-400 group-hover:text-teal-600' },
  store: { accent: 'border-t-indigo-500', hoverBg: 'hover:bg-indigo-50', iconColor: 'text-indigo-400 group-hover:text-indigo-600' },
};

const DEFAULT_COLORS = { accent: 'border-t-primary-500', hoverBg: 'hover:bg-primary-50', iconColor: 'text-gray-400 group-hover:text-primary-500' };

const ICON_MAP: Record<string, (props: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  home: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  train: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  scale: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>,
  palette: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
  camera: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>,
  briefcase: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>,
  map: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0-8.25a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V15m0 0a1.5 1.5 0 110 3m0-3a1.5 1.5 0 100 3m-3.375 0h10.5a1.5 1.5 0 001.5-1.5V5.625a1.5 1.5 0 00-1.5-1.5H5.625a1.5 1.5 0 00-1.5 1.5v12.75a1.5 1.5 0 001.5 1.5z" /></svg>,
  people: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  newspaper: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>,
  calendar: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  utensils: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" /></svg>,
  video: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>,
  trophy: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.985 6.985 0 01-4.27 1.472 6.985 6.985 0 01-4.27-1.472" /></svg>,
  tag: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
  shopping: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  music: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>,
  heart: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  star: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  globe: (p) => <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
};

function CategoryIcon({ icon, className = 'w-4 h-4' }: { icon: string | null | undefined; className?: string }) {
  const svgProps = {
    className,
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.5,
  };

  const resolved = icon?.toLowerCase();
  const renderer = resolved ? ICON_MAP[resolved] : null;

  if (renderer) {
    return renderer(svgProps);
  }

  // Default book icon
  return (
    <svg {...svgProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function SkeletonLoader() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="py-2 px-3 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="ml-6 space-y-1.5">
            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
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
  const colors = SECTION_COLORS[section.key] || DEFAULT_COLORS;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 top-16 bg-black/20 animate-backdrop-in z-40"
        aria-hidden="true"
        onClick={onNavigate}
      />

      {/* Dropdown panel */}
      <div
        className="absolute left-0 right-0 top-full z-50 animate-dropdown-in"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="container mx-auto px-4 pt-2">
          <div className={`bg-white/95 backdrop-blur-xl border border-gray-200/60 border-t-[3px] ${colors.accent} rounded-xl shadow-xl overflow-hidden`}>
            {/* Header with explore link */}
            <div className="px-6 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.label} Categories
              </h3>
              <Link
                href={section.href}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
                onClick={onNavigate}
              >
                Explore All {section.label}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {isLoading ? (
              <SkeletonLoader />
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500 mb-2">No categories available yet.</p>
                <Link
                  href={section.href}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
                  onClick={onNavigate}
                >
                  Explore {section.label}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-1 p-4 max-h-[60vh] overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.slug} className="group">
                    <Link
                      href={buildHref(section.categoryBasePath, cat.slug, section.slugTransform)}
                      className={`flex items-center gap-2.5 py-2 px-3 rounded-lg transition-colors ${colors.hoverBg}`}
                      onClick={onNavigate}
                    >
                      <span className={`shrink-0 transition-colors ${colors.iconColor}`}>
                        <CategoryIcon icon={cat.icon} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-800 group-hover:text-gray-900 truncate">
                          {cat.name}
                        </span>
                        {cat.listing_count != null && cat.listing_count > 0 && (
                          <span className="block text-xs text-gray-400">
                            {cat.listing_count} {cat.listing_count === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </span>
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <ul className="ml-9 mb-1 space-y-0.5">
                        {cat.children.map((child) => (
                          <li key={child.slug}>
                            <Link
                              href={buildHref(
                                section.categoryBasePath,
                                child.slug,
                                section.slugTransform,
                              )}
                              className="block py-1 px-2 text-xs text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded transition-colors"
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
    </>
  );
}
