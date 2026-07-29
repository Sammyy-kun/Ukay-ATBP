export function DashboardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div className="h-6 w-32 rounded-lg bg-neutral-200"></div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-xl bg-neutral-200"></div>
          <div className="h-9 w-28 rounded-xl bg-neutral-200"></div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:p-5">
            <div className="mb-2 h-4 w-20 rounded bg-neutral-200"></div>
            <div className="h-8 w-16 rounded bg-neutral-200"></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="h-10 flex-1 rounded-xl bg-neutral-200"></div>
        <div className="h-10 w-full sm:w-32 rounded-xl bg-neutral-200"></div>
        <div className="h-10 w-full sm:w-32 rounded-xl bg-neutral-200"></div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
            <div className="aspect-[4/5] w-full bg-neutral-200"></div>
            <div className="p-3 sm:p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-neutral-200"></div>
              <div className="flex justify-between">
                <div className="h-4 w-12 rounded bg-neutral-200"></div>
                <div className="h-4 w-16 rounded bg-neutral-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
