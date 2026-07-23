import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Certificates } from "@/components/certificates";
import { SectionShell } from "@/components/section-shell";
import { SectionLeadingIcon } from "@/components/section-leading-icon";
import { getFeaturedCertificates } from "@/data/db";

export async function CertsSection() {
  const certificates = await getFeaturedCertificates();
  return (
    <SectionShell id="certificates" title="Achievements unlocked." description="Training and conference milestones that sharpened the work." headingAdornment={<SectionLeadingIcon name="certificates" />}>
      <Certificates certificates={certificates} />
      <Link href="/certificates" className="pixel-button mt-7 bg-card text-foreground">View all certificates <ArrowRight className="size-4" /></Link>
    </SectionShell>
  );
}
