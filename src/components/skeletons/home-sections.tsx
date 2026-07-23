export function HeroSkeleton() {
  return (
    <header id="top" className="immersive-hero">
      <div className="flex min-h-[70dvh] items-end px-5 pb-16 md:px-10 md:pb-24">
        <div className="max-w-xl space-y-6">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-16 w-64 animate-pulse rounded bg-white/10 md:h-24 md:w-96" />
          <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-full max-w-[48ch] animate-pulse rounded bg-white/10" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="flex gap-3">
            <div className="h-9 w-28 animate-pulse rounded-lg bg-white/10" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppsSectionSkeleton() {
  return (
    <div className="border-t border-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid border-b border-border py-6 md:grid-cols-[8rem_1fr_14rem] md:gap-6 md:px-4">
          <div className="size-20 animate-pulse rounded-[6px] bg-secondary md:size-24" />
          <div className="mt-4 space-y-3 md:mt-0">
            <div className="h-5 w-48 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-64 animate-pulse rounded bg-secondary" />
            <div className="flex gap-3">
              <div className="h-3 w-12 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
            </div>
          </div>
          <div className="hidden h-28 w-24 animate-pulse rounded-[4px] bg-secondary md:block" />
        </div>
      ))}
    </div>
  );
}

export function WorkSectionSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="relative pl-[4.5rem]">
          <div className="absolute left-[2rem] top-1 size-3 animate-pulse rounded-full bg-secondary" />
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AboutSectionSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="space-y-4">
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-secondary" />
          ))}
        </div>
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-secondary md:h-80" />
    </div>
  );
}

export function CertsSectionSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="pixel-frame space-y-3 bg-card p-5">
          <div className="h-32 w-full animate-pulse rounded bg-secondary" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function ContactSectionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-secondary" />
      ))}
    </div>
  );
}
