export default function AdminLoading() {
  return (
    <div>
      <span className="sr-only">Loading...</span>

      {/* Welcome heading */}
      <div className="mb-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
            <div className="mt-2 h-3 w-32 bg-gray-100 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5 animate-pulse">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 12 }).map((_, j) => (
                <div key={j} className="flex-1 flex flex-col items-center gap-1">
                  <div className="h-3 w-4 bg-gray-100 dark:bg-gray-600 rounded" />
                  <div
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-md"
                    style={{ height: `${20 + ((j * 17) % 60)}%`, minHeight: '4px' }}
                  />
                  <div className="h-3 w-4 bg-gray-100 dark:bg-gray-600 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Popular content table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-5 animate-pulse">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-6 bg-gray-100 dark:bg-gray-600 rounded" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-16 bg-gray-100 dark:bg-gray-600 rounded-full" />
              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-600 rounded" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-gray-600 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-16 bg-gray-100 dark:bg-gray-600 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
