import Link from 'next/link';

const POPULAR_SECTIONS = [
  {
    name: 'News',
    href: '/news',
    description: 'Latest Berlin stories',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
      </svg>
    ),
  },
  {
    name: 'Events',
    href: '/events',
    description: "What's happening in Berlin",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    name: 'Dining',
    href: '/dining',
    description: 'Restaurants & cafes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125C3.504 21.75 3 21.246 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
      </svg>
    ),
  },
  {
    name: 'Guide',
    href: '/guide',
    description: 'Living in Berlin',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21" />
      </svg>
    ),
  },
  {
    name: 'Videos',
    href: '/videos',
    description: 'Berlin video series',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    name: 'Competitions',
    href: '/competitions',
    description: 'Win prizes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 3.75a3.75 3.75 0 0 0-3.75 3.75 3.75 3.75 0 0 0 3.75 3.75 3.75 3.75 0 0 0 3.75-3.75A3.75 3.75 0 0 0 12 3.75Z" />
      </svg>
    ),
  },
  {
    name: 'Classifieds',
    href: '/classifieds',
    description: 'Buy & sell locally',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
  },
  {
    name: 'Store',
    href: '/store',
    description: 'Berlin-inspired products',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
];

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center">
        {/* Berlin Bear illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-primary-50 rounded-full mb-4">
            <svg className="w-20 h-20 text-primary-400" viewBox="0 0 100 100" fill="currentColor">
              {/* Bear head */}
              <circle cx="50" cy="50" r="30" opacity="0.9" />
              {/* Bear ears */}
              <circle cx="28" cy="28" r="12" opacity="0.9" />
              <circle cx="72" cy="28" r="12" opacity="0.9" />
              <circle cx="28" cy="28" r="7" fill="white" opacity="0.4" />
              <circle cx="72" cy="28" r="7" fill="white" opacity="0.4" />
              {/* Eyes - confused/dizzy look */}
              <text x="38" y="50" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">x</text>
              <text x="62" y="50" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">x</text>
              {/* Snout */}
              <ellipse cx="50" cy="58" rx="10" ry="7" fill="white" opacity="0.5" />
              <circle cx="50" cy="55" r="3" fill="white" opacity="0.8" />
              {/* Confused mouth */}
              <path d="M43 64 Q50 60 57 64" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              {/* Question mark */}
              <text x="78" y="25" fontSize="18" fill="currentColor" fontWeight="bold" opacity="0.5">?</text>
            </svg>
          </div>
          <span className="text-7xl md:text-8xl font-bold gradient-text">404</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Oops, wrong turn!
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          Even the Berlin Bear gets lost sometimes. The page you are looking
          for does not exist or may have been moved.
        </p>

        {/* Search input */}
        <div className="max-w-md mx-auto mb-8">
          <form action="/search" method="GET" className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search ILOVEBERLIN..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </form>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-center mb-12">
          <Link
            href="/"
            className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Popular sections */}
        <div className="border-t border-gray-100 pt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Explore Popular Sections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {POPULAR_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="text-gray-400 group-hover:text-primary-500 transition-colors">
                    {section.icon}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors text-sm">
                      {section.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
