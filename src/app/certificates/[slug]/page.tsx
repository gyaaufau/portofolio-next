import { CertificateDetailView } from "@/components/certificate-detail-view";
import { portfolioCertificates } from "@/data/portfolio";
import { absoluteUrl, siteConfig } from "@/data/seo";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return portfolioCertificates.map((certificate) => ({
    slug: certificate.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const certificate = portfolioCertificates.find((c) => c.id === slug);

  if (!certificate) {
    return {
      title: "Certificate Not Found | Gialoop",
    };
  }

  return {
    title: `${certificate.title} | Gialoop`,
    description: certificate.summary,
    openGraph: {
      title: `${certificate.title} | Gialoop`,
      description: certificate.summary,
      url: absoluteUrl(`/certificates/${slug}`),
    },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { slug } = await params;
  const certificate = portfolioCertificates.find((c) => c.id === slug);

  if (!certificate) {
    notFound();
  }

  const certificateSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: certificate.title,
    description: certificate.summary,
    url: absoluteUrl(`/certificates/${slug}`),
    author: {
      "@type": "Organization",
      name: certificate.issuer
    }
  };

  return (
    <main className="relative w-full max-w-[1280px] mx-auto px-6 pt-6 pb-20">
      <Link className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors w-fit" href="/certificates">
        <ChevronLeft className="w-3.5 h-3.5" /> back / certificates
      </Link>

      <CertificateDetailView certificate={certificate} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(certificateSchema),
        }}
      />
    </main>
  );
}
