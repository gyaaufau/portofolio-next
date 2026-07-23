import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";

export default function CertificatesLoading() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
      <div className="mt-10 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
        <div className="h-10 w-64 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-secondary" />
      </div>
      <div className="mt-9">
        <CardGridSkeleton cards={6} />
      </div>
    </main>
  );
}
