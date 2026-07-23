export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-7 w-40 animate-pulse rounded bg-secondary" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-secondary" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="size-10 shrink-0 animate-pulse rounded-lg bg-secondary" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
            </div>
            <div className="flex items-center gap-2">
              <div className="size-8 animate-pulse rounded-lg bg-secondary" />
              <div className="size-8 animate-pulse rounded-lg bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
