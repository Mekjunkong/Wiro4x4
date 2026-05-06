/**
 * Reusable skeleton loading components for public-facing pages.
 * Uses Tailwind animate-pulse for shimmer effect.
 * Matches actual content layouts to prevent layout shift.
 */

/** Skeleton for tour cards in the Tours grid (3-col layout) */
export function TourCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden border border-accent/30 rounded-sm bg-card"
          role="status"
          aria-label="Loading tour"
        >
          {/* Image area */}
          <div className="aspect-[16/10] bg-muted animate-pulse" />
          {/* Content area */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
            {/* Duration + difficulty row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
            {/* Tags */}
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-muted rounded-sm animate-pulse" />
              <div className="h-6 w-14 bg-muted rounded-sm animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded-sm animate-pulse" />
            </div>
            {/* View Details */}
            <div className="h-4 w-28 bg-muted rounded animate-pulse pt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for blog post cards (3-col layout) */
export function BlogCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden border border-accent/30 rounded-sm bg-card"
          role="status"
          aria-label="Loading blog post"
        >
          {/* Image */}
          <div className="h-56 bg-muted animate-pulse" />
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Date + read time */}
            <div className="flex items-center gap-4">
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 w-full bg-muted rounded animate-pulse" />
              <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
            </div>
            {/* Excerpt */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
            {/* Read More */}
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for review cards */
export function ReviewCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-sm p-6 space-y-3"
          role="status"
          aria-label="Loading review"
        >
          {/* Header: name + stars */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, j) => (
                <div
                  key={j}
                  className="h-5 w-5 bg-muted rounded animate-pulse"
                />
              ))}
            </div>
          </div>
          {/* Review text */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
          {/* Date */}
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
