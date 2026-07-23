import { Suspense } from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { AppsSection } from "@/components/sections/apps-section";
import { WorkSection } from "@/components/sections/work-section";
import { AboutSection } from "@/components/sections/about-section";
import { CertsSection } from "@/components/sections/certs-section";
import { ContactSection } from "@/components/sections/contact-section";
import {
  HeroSkeleton,
  AppsSectionSkeleton,
  WorkSectionSkeleton,
  AboutSectionSkeleton,
  CertsSectionSkeleton,
  ContactSectionSkeleton,
} from "@/components/skeletons/home-sections";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="main-content" className="w-full pb-20">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-6">
        <Suspense fallback={<AppsSectionSkeleton />}>
          <AppsSection />
        </Suspense>

        <Suspense fallback={<WorkSectionSkeleton />}>
          <WorkSection />
        </Suspense>

        <Suspense fallback={<AboutSectionSkeleton />}>
          <AboutSection />
        </Suspense>

        <Suspense fallback={<CertsSectionSkeleton />}>
          <CertsSection />
        </Suspense>

        <Suspense fallback={<ContactSectionSkeleton />}>
          <ContactSection />
        </Suspense>
      </div>
    </main>
  );
}
