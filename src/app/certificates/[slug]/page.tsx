import { CertificateDetailView } from "@/components/certificate-detail-view";
import { getCertificateBySlug } from "@/data/db";
import { absoluteUrl } from "@/data/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const certificate = await getCertificateBySlug(slug);

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
      images: certificate.image ? [{ url: certificate.image.src, alt: certificate.image.alt }] : undefined,
    },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { slug } = await params;
  const certificate = await getCertificateBySlug(slug);

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
    <main id="main-content" className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
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
