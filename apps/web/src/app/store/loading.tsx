const shimmer =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

export default function StoreLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <span className="sr-only">Loading...</span>

      {/* Hero Section with icon placeholder */}
      <section className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 ${shimmer}`} />
        <div className={`h-9 w-48 rounded-xl mx-auto mb-2 ${shimmer}`} />
        <div className={`h-4 w-96 max-w-full rounded-xl mx-auto mb-1 ${shimmer}`} />
        <div className={`h-4 w-72 max-w-full rounded-xl mx-auto ${shimmer}`} />
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

      {/* Latest Products heading */}
      <div className="mb-4">
        <div className={`h-7 w-48 rounded-xl ${shimmer}`} />
      </div>

      {/* Product card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Square product image */}
            <div className={`aspect-square ${shimmer}`} />
            <div className="p-4 space-y-3">
              {/* Category */}
              <div className={`h-4 w-20 rounded-full ${shimmer}`} />
              {/* Product name */}
              <div className={`h-5 w-full rounded-xl ${shimmer}`} />
              {/* Short description */}
              <div className={`h-4 w-full rounded-xl ${shimmer}`} />
              <div className={`h-4 w-3/4 rounded-xl ${shimmer}`} />
              {/* Price row */}
              <div className="flex items-center justify-between pt-2">
                <div className={`h-7 w-20 rounded-xl ${shimmer}`} />
                <div className={`h-9 w-24 rounded-xl ${shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
