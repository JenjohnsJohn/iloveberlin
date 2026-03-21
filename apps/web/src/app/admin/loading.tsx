const shimmer =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

const shimmerSubtle =
  'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer dark:from-gray-600 dark:via-gray-500 dark:to-gray-600';

export default function AdminLoading() {
  return (
    <div>
      <span className="sr-only">Loading...</span>

      {/* Welcome heading */}
      <div className="mb-4">
        <div className={`h-7 w-40 rounded-xl ${shimmer}`} />
        <div className={`h-4 w-72 rounded-xl mt-1.5 ${shimmer}`} />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className={`h-4 w-24 rounded-xl ${shimmer}`} />
                <div className={`h-7 w-16 rounded-xl ${shimmer}`} />
              </div>
              <div className={`w-10 h-10 rounded-xl ${shimmer}`} />
            </div>
            <div className={`mt-2.5 h-3 w-32 rounded-xl ${shimmerSubtle}`} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className={`h-5 w-48 rounded-xl mb-4 ${shimmer}`} />
            <div className="flex items-end gap-1.5 h-36">
              {Array.from({ length: 12 }).map((_, j) => (
                <div key={j} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md ${shimmer}`}
                    style={{ height: `${20 + ((j * 17) % 60)}%`, minHeight: '6px' }}
                  />
                  <div className={`h-3 w-5 rounded ${shimmerSubtle}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Popular content table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className={`h-5 w-36 rounded-xl ${shimmer}`} />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`h-4 w-6 rounded-xl ${shimmerSubtle}`} />
              <div className={`h-4 w-48 rounded-xl ${shimmer}`} />
              <div className={`h-5 w-16 rounded-full ${shimmerSubtle}`} />
              <div className={`h-4 w-16 rounded-xl ${shimmerSubtle}`} />
              <div className={`h-4 w-24 rounded-xl ${shimmerSubtle}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className={`h-5 w-32 rounded-xl ${shimmer}`} />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full ${shimmer}`} />
                <div className={`h-4 w-64 rounded-xl ${shimmer}`} />
              </div>
              <div className={`h-3 w-16 rounded-xl ${shimmerSubtle}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
