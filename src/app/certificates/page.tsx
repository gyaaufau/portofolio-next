import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { Certificates } from "@/components/certificates";
import { PublicPageHeader } from "@/components/public-page-header";
import { getCertificates } from "@/data/db";
import { absoluteUrl, siteConfig } from "@/data/seo";

const collectionSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Certificates | Gialoop", url: absoluteUrl("/certificates"), description: "Professional learning milestones for Argya Aulia Fauzandika.", isPartOf: { "@type": "WebSite", name: siteConfig.siteName, url: siteConfig.siteUrl } };
export const metadata: Metadata = { title: "Certificates | Gialoop", description: "Flutter training, developer conferences, and professional learning milestones." };
export const revalidate = 3600;

export default async function CertificatesPage() {
  const certificates = await getCertificates();
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <BackLink href="/" label="Home" />
      <PublicPageHeader eyebrow="ACHIEVEMENT ROOM" title="Proof of practice." description="Training, conferences, and focused study that strengthened the way I build mobile products." ornament="certificate-plaque" />
      <Certificates certificates={certificates} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </main>
  );
}
