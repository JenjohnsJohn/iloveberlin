export default function DiningLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <span className="sr-only">Loading...</span>

      {/* Hero Section */}
      <section className="text-center mb-8 animate-pulse">
        <div className="h-9 w-52 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2" />
        <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1" />
        <div className="h-4 w-72 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
      </section>

      {/* Cuisine Grid placeholder */}
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

      {/* Latest Restaurants heading */}
      <div className="animate-pulse mb-4">
        <div className="h-6 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Restaurant card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              {/* Cuisine tags */}
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              {/* Name */}
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              {/* Description */}
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
              {/* Price + rating row */}
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              {/* District */}
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
