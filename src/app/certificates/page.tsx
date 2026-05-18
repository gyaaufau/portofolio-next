import { Certificates } from "@/components/certificates";
import { portfolioCertificates } from "@/data/portfolio";
import { absoluteUrl, siteConfig, websiteSchema } from "@/data/seo";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Certificates | Gialoop",
  url: absoluteUrl("/certificates"),
  description: "Certificate archive for Argya Aulia Fauzandika, including Flutter training and developer conference credentials.",
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: siteConfig.siteUrl
  }
};

export const metadata: Metadata = {
  title: "Certificates | Gialoop",
  description: "Certificate archive covering Flutter training, developer conferences, and professional learning milestones.",
};

export default function CertificatesPage() {
  return (
    <main className="relative w-full max-w-[1280px] mx-auto px-6 pt-6 pb-20">
      <section className="mt-4 p-6 rounded-3xl bg-card border border-border shadow-sm">
        <Link className="inline-flex items-center gap-1.5 text-primary text-[0.82rem] font-semibold lowercase mb-6" href="/">
          <ChevronLeft className="w-4 h-4" /> back / home
        </Link>

        <div className="mb-6">
          <p className="m-0 mb-[0.75rem] text-primary text-[0.8rem] font-semibold tracking-[0.06em] uppercase">all certificates</p>
          <h1 className="m-0 text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.03em] font-bold">Certificate archive.</h1>
          <p className="mt-2 text-muted-foreground">Featured and regular certificates are collected here. Featured items are marked directly on the card.</p>
        </div>

        <Certificates certificates={portfolioCertificates} showFeaturedChip={true} />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
    </main>
  );
}
