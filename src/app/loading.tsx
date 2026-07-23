import { HeroSkeleton, AppsSectionSkeleton, WorkSectionSkeleton, AboutSectionSkeleton } from "@/components/skeletons/home-sections";

export default function Loading() {
  return (
    <main id="main-content" className="w-full">
      <HeroSkeleton />
      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-6">
        <section className="py-16 md:py-24">
          <div className="max-w-2xl space-y-3">
            <div className="h-10 w-64 animate-pulse rounded bg-secondary" />
            <div className="mt-4 h-4 w-80 animate-pulse rounded bg-secondary" />
          </div>
          <div className="mt-9"><AppsSectionSkeleton /></div>
        </section>
        <section className="py-16 md:py-24">
          <div className="max-w-2xl space-y-3">
            <div className="h-10 w-48 animate-pulse rounded bg-secondary" />
            <div className="mt-4 h-4 w-72 animate-pulse rounded bg-secondary" />
          </div>
          <div className="mt-9"><WorkSectionSkeleton /></div>
        </section>
        <section className="py-16 md:py-24">
          <div className="max-w-2xl space-y-3">
            <div className="h-10 w-56 animate-pulse rounded bg-secondary" />
            <div className="mt-4 h-4 w-64 animate-pulse rounded bg-secondary" />
          </div>
          <div className="mt-9"><AboutSectionSkeleton /></div>
        </section>
      </div>
      <p className="sr-only">Loading portfolio</p>
    </main>
  );
}
