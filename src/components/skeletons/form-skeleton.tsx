export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-12 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-7 w-36 animate-pulse rounded bg-secondary" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-secondary" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-secondary" />
      </div>
    </div>
  );
}
