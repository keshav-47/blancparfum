import { Skeleton } from "@/components/ui/skeleton";

const RouteFallback = () => (
  <div className="min-h-screen flex flex-col overflow-x-hidden">
    <div className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-4 md:px-8">
      <Skeleton className="h-6 w-32" />
      <div className="hidden md:flex gap-6">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>

    <main className="flex-1 pt-16">
      <Skeleton className="w-full h-[60vh] rounded-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-12">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default RouteFallback;
