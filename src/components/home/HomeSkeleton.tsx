import { Skeleton } from "@/components/ui/skeleton"

export const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-8 max-w-md mx-auto">
      {/* Profile dropdown skeleton */}
      <div className="w-full flex justify-end mb-8">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      {/* Welcome message skeleton */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>

      {/* Action buttons skeleton */}
      <div className="w-full space-y-6">
        {/* Utility action skeleton */}
        <Skeleton className="w-full h-12 rounded-2xl" />

        {/* Main actions skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <Skeleton key={index} className="w-full h-14 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-12 flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-24 h-8" />
      </div>
    </div>
  )
}