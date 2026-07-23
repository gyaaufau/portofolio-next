export function StatCardsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-7 w-40 animate-pulse rounded bg-secondary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="size-5 animate-pulse rounded bg-secondary" />
            <div className="h-8 w-16 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
      <div>
        <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
        <div className="mt-3 flex gap-3">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-secondary" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-secondary" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-secondary" />
        </div>
      </div>
    </div>
  );
}
