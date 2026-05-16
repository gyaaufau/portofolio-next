import { Navbar } from "@/components/navbar";
import { Certificates } from "@/components/certificates";
import { portfolioCertificates } from "@/data/portfolio";
import { absoluteUrl, siteConfig, websiteSchema } from "@/data/seo";
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
    <main className="page-shell">
      <Navbar />

      <section className="project-page-top panel">
        <Link className="back-link" href="/#certificates">back / home</Link>
      </section>

      <section className="project-archive-page panel">
        <div className="project-archive-head">
          <p className="section-eyebrow">all certificates</p>
          <h1>Certificate archive.</h1>
          <p>Featured and regular certificates are collected here. Featured items are marked directly on the card.</p>
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
