import Link from 'next/link';

const POPULAR_SECTIONS = [
  { name: 'News', href: '/news', description: 'Latest Berlin stories' },
  { name: 'Events', href: '/events', description: 'What\'s happening in Berlin' },
  { name: 'Dining', href: '/dining', description: 'Restaurants & cafes' },
  { name: 'Guide', href: '/guide', description: 'Living in Berlin' },
  { name: 'Videos', href: '/videos', description: 'Berlin video series' },
  { name: 'Competitions', href: '/competitions', description: 'Win prizes' },
  { name: 'Classifieds', href: '/classifieds', description: 'Buy & sell locally' },
  { name: 'Store', href: '/store', description: 'Berlin-inspired products' },
];

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        {/* Berlin-themed 404 header */}
        <div className="mb-6">
          <span className="text-8xl md:text-9xl font-bold text-primary-200">404</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Looks like you have taken a wrong turn in Berlin. The page you are looking
          for does not exist or may have been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>

        {/* Popular sections */}
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Explore Popular Sections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POPULAR_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {section.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
