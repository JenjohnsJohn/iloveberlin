export default function ClassifiedsLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <span className="sr-only">Loading...</span>

      {/* Hero Section */}
      <section className="text-center mb-8 animate-pulse">
        <div className="h-9 w-60 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2" />
        <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6" />
        {/* Post a Listing button placeholder */}
        <div className="h-12 w-44 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto" />
      </section>

      {/* Category Grid placeholder */}
      <section className="mb-8 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1" />
              <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Listings heading */}
      <div className="animate-pulse mb-4">
        <div className="h-6 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Classified listing card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Image placeholder */}
            <div className="h-44 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              {/* Category + condition */}
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              {/* Title */}
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              {/* Price */}
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              {/* Location + date row */}
              <div className="flex items-center justify-between pt-1">
                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
