import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:p-5">
            <Skeleton className="mb-2 h-4 w-20 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-32 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-32 rounded-xl" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="p-3 sm:p-4 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
