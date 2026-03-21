const shimmer =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

export default function EventsLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <span className="sr-only">Loading...</span>

      {/* Hero Section */}
      <section className="text-center mb-8">
        <div className={`h-9 w-52 rounded-xl mx-auto mb-2 ${shimmer}`} />
        <div className={`h-4 w-96 max-w-full rounded-xl mx-auto ${shimmer}`} />
      </section>

      {/* Category Grid placeholder */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center"
            >
              <div className={`h-10 w-10 rounded-full mx-auto mb-2 ${shimmer}`} />
              <div className={`h-4 w-20 rounded-xl mx-auto mb-1 ${shimmer}`} />
              <div className={`h-3 w-8 rounded-xl mx-auto ${shimmer}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Events heading */}
      <div className="mb-4">
        <div className={`h-7 w-44 rounded-xl ${shimmer}`} />
      </div>

      {/* Event card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Image with date overlay */}
            <div className="relative">
              <div className={`aspect-[16/10] ${shimmer}`} />
              {/* Date badge overlay (top-left) */}
              <div className="absolute top-3 left-3">
                <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-2 text-center shadow-sm w-14">
                  <div className={`h-4 w-8 rounded mx-auto mb-1 ${shimmer}`} />
                  <div className={`h-5 w-6 rounded mx-auto ${shimmer}`} />
                </div>
              </div>
              {/* Category badge overlay (top-right) */}
              <div className="absolute top-3 right-3">
                <div className={`h-5 w-16 rounded-full ${shimmer} opacity-80`} />
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className={`h-5 w-full rounded-xl ${shimmer}`} />
              <div className={`h-5 w-2/3 rounded-xl ${shimmer}`} />
              {/* Date + time row */}
              <div className="flex items-center gap-3 pt-1">
                <div className={`h-4 w-28 rounded-xl ${shimmer}`} />
                <div className={`h-4 w-20 rounded-xl ${shimmer}`} />
              </div>
              {/* Venue */}
              <div className={`h-4 w-40 rounded-xl ${shimmer}`} />
              {/* Price badge */}
              <div className={`h-6 w-16 rounded-full ${shimmer}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
