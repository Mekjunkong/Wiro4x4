/**
 * Skeleton loading components for admin dashboard.
 * Uses Tailwind animate-pulse on bg-muted blocks.
 */

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-6">
      {/* Header row */}
      <div className="flex gap-4 pb-3 border-b border-border">
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/5 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/6 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 py-3">
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/5 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/6 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function GalleryGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
