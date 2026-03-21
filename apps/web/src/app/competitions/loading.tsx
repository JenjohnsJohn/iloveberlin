export default function CompetitionsLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <span className="sr-only">Loading...</span>

      {/* Hero Section with trophy icon placeholder */}
      <section className="text-center mb-8 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2" />
        <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4" />
        <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
      </section>

      {/* Category Grid placeholder */}
      <section className="mb-8 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1" />
              <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Competitions heading */}
      <div className="animate-pulse mb-4">
        <div className="h-6 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Competition card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              {/* Status badge */}
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              {/* Title */}
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
              {/* Prize description */}
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              {/* End date + entries row */}
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
