export default function VideosLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <span className="sr-only">Loading...</span>

      {/* Hero Section */}
      <section className="text-center mb-8 animate-pulse">
        <div className="h-9 w-52 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2" />
        <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
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

      {/* Latest Videos heading */}
      <div className="animate-pulse mb-4">
        <div className="h-6 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Video card grid — wider aspect ratio for video thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* 16:9 video thumbnail placeholder */}
            <div className="relative">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 h-5 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
            <div className="p-4 space-y-2">
              {/* Series / Category */}
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
              {/* Title */}
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              {/* Published date */}
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded pt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
