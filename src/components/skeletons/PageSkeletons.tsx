import { Skeleton } from "@/components/ui/skeleton";

/**
 * Page skeletons that mirror each route's real layout so the shape stays
 * constant across: route-chunk load (Suspense fallback) → data load → content.
 *
 * Skeleton bodies are CONTENT-ONLY (no navbar/footer). They assume they're
 * rendered inside a `pt-16` main:
 *   - Suspense fallback  →  wrapped in <SkeletonShell> (fake fixed navbar)
 *   - In-page data load  →  wrapped in the page's real <Layout>
 */

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20";

/** Reusable 3-up product card grid (matches Shop/Collection/Home cards). */
export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 md:gap-x-8 md:gap-y-16">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export const HomeSkeleton = () => (
  <>
    <Skeleton className="w-full h-[80vh] rounded-none" />
    <div className={`${CONTAINER} py-16 md:py-24 space-y-12`}>
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-72 max-w-[80%]" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  </>
);

export const ShopSkeleton = () => (
  <>
    <Skeleton className="w-full h-[45vh] md:h-[55vh] rounded-none" />
    <div className="sticky top-16 z-40 bg-background/95 border-b border-border/50">
      <div className={`${CONTAINER} py-3 space-y-3`}>
        <Skeleton className="h-10 w-full rounded-full" />
        <div className="flex gap-2 sm:gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-full flex-shrink-0" />)}
        </div>
      </div>
    </div>
    <div className={`${CONTAINER} py-16 md:py-20`}>
      <ProductGridSkeleton count={6} />
    </div>
  </>
);

export const ProductDetailSkeleton = () => (
  <div className={`${CONTAINER} pt-24 pb-16`}>
    <Skeleton className="h-3 w-28 mb-10" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      {/* Images */}
      <div>
        <Skeleton className="aspect-[3/4] w-full rounded-xl mb-4" />
        <div className="flex gap-2 sm:gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />
          ))}
        </div>
      </div>
      {/* Details */}
      <div className="space-y-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-7 w-28" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-16 rounded-full" />)}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <Skeleton className="h-14 w-full rounded-full" />
        <div className="flex gap-8 border-b border-border pb-3 pt-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-20" />)}
        </div>
        <div className="grid grid-cols-3 gap-6 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const CollectionDetailSkeleton = () => (
  <div className={`${CONTAINER} pt-24 pb-16`}>
    <div className="flex flex-col items-center gap-4 mb-14">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-64 max-w-[80%]" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
    <ProductGridSkeleton count={6} />
  </div>
);

export const CartSkeleton = () => (
  <div className={`${CONTAINER} pt-24 pb-16`}>
    <Skeleton className="h-8 w-40 mb-10" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border pb-6">
            <Skeleton className="w-24 h-28 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full rounded-full mt-4" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className={`max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 pb-16`}>
    <div className="flex items-center gap-4 mb-10">
      <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-52" />
      </div>
    </div>
    <div className="flex gap-6 border-b border-border mb-8">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-24 mb-3" />)}
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
    </div>
  </div>
);

/** Generic fallback for simple/static pages (login, legal, contact, admin, etc.). */
export const PageSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-16 space-y-6">
    <Skeleton className="h-9 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
    <div className="pt-6 space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);
