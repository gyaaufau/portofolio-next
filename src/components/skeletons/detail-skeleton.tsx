export function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-4 animate-pulse rounded bg-secondary" />
      </div>
      <div className="flex items-start gap-6">
        <div className="size-20 shrink-0 animate-pulse rounded-[6px] bg-secondary md:size-24" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-8 w-64 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
          <div className="flex gap-3">
            <div className="h-5 w-16 animate-pulse rounded bg-secondary" />
            <div className="h-5 w-16 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-xl bg-secondary" />
        <div className="h-48 animate-pulse rounded-xl bg-secondary" />
      </div>
    </div>
  );
}
