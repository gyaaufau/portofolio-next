import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateCertificate } from "../../../actions";
import { CertForm } from "../../cert-form";

export const dynamic = "force-dynamic";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) notFound();

  return (
    <CertForm
      action={async (formData: FormData) => { "use server"; await updateCertificate(id, formData); }}
      initialData={{
        title: cert.title,
        issuer: cert.issuer,
        issued: cert.issued,
        type: cert.type,
        summary: cert.summary,
        details: cert.details,
        relevance: cert.relevance,
        issuerNotes: cert.issuerNotes,
        featured: cert.featured,
        imageSrc: cert.imageSrc ?? undefined,
        imageAlt: cert.imageAlt ?? undefined,
        imageWidth: cert.imageWidth ?? undefined,
        imageHeight: cert.imageHeight ?? undefined,
      }}
      submitLabel="Update"
    />
  );
}
