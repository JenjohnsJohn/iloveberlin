const shimmer =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <span className="sr-only">Loading...</span>

      {/* Hero carousel skeleton */}
      <section className="relative mb-10 rounded-xl overflow-hidden">
        <div className={`w-full aspect-[21/9] ${shimmer}`} />
        {/* Overlay text area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
          <div className={`h-10 w-80 max-w-full rounded-xl ${shimmer} opacity-70`} />
          <div className={`h-4 w-96 max-w-full rounded-xl ${shimmer} opacity-60`} />
          <div className={`h-4 w-64 max-w-full rounded-xl ${shimmer} opacity-50`} />
          <div className={`mt-2 h-10 w-36 rounded-xl ${shimmer} opacity-60`} />
        </div>
        {/* Carousel dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full ${i === 0 ? 'w-6' : 'w-2'} bg-white/40`}
            />
          ))}
        </div>
      </section>

      {/* Featured content row */}
      <section className="mb-10">
        <div className={`h-7 w-48 rounded-xl mb-5 ${shimmer}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className={`aspect-[16/10] ${shimmer}`} />
              <div className="p-4 space-y-3">
                <div className={`h-4 w-20 rounded-full ${shimmer}`} />
                <div className={`h-5 w-full rounded-xl ${shimmer}`} />
                <div className={`h-4 w-3/4 rounded-xl ${shimmer}`} />
                <div className="flex items-center gap-2 pt-1">
                  <div className={`h-7 w-7 rounded-full ${shimmer}`} />
                  <div className={`h-3 w-24 rounded-xl ${shimmer}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Card grid */}
      <section>
        <div className={`h-7 w-40 rounded-xl mb-5 ${shimmer}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className={`aspect-[16/10] ${shimmer}`} />
              <div className="p-4 space-y-3">
                <div className={`h-4 w-16 rounded-full ${shimmer}`} />
                <div className={`h-5 w-full rounded-xl ${shimmer}`} />
                <div className={`h-4 w-5/6 rounded-xl ${shimmer}`} />
                <div className="flex items-center gap-2 pt-1">
                  <div className={`h-7 w-7 rounded-full ${shimmer}`} />
                  <div className={`h-3 w-24 rounded-xl ${shimmer}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
