import { DetailSkeleton } from "@/components/skeletons/detail-skeleton";

export default function CertificateDetailLoading() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <DetailSkeleton />
    </main>
  );
}
