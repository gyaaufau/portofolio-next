import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { Certificates } from "@/components/certificates";
import { getCertificates } from "@/data/db";
import { absoluteUrl, siteConfig } from "@/data/seo";

const collectionSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Certificates | Gialoop", url: absoluteUrl("/certificates"), description: "Professional learning milestones for Argya Aulia Fauzandika.", isPartOf: { "@type": "WebSite", name: siteConfig.siteName, url: siteConfig.siteUrl } };
export const metadata: Metadata = { title: "Certificates | Gialoop", description: "Flutter training, developer conferences, and professional learning milestones." };
export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const certificates = await getCertificates();
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <BackLink href="/" label="Home" />
      <header className="max-w-3xl py-14 md:py-20">
        <p className="text-pixel text-[9px] text-primary">ACHIEVEMENT ROOM</p>
        <h1 className="mt-5 text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">Proof of practice.</h1>
        <p className="mt-6 max-w-[58ch] text-lg leading-8 text-muted-foreground">Training, conferences, and focused study that strengthened the way I build mobile products.</p>
      </header>
      <Certificates certificates={certificates} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </main>
  );
}
