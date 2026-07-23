import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { updateCertificate } from "@/app/admin/actions";
import { CertForm } from "../../cert-form";

export const dynamic = "force-dynamic";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: cert } = await supabase.from("certificate").select("*").eq("id", id).single();
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
        issuerNotes: cert.issuer_notes,
        featured: cert.featured,
        imageSrc: cert.image_src ?? undefined,
        imageAlt: cert.image_alt ?? undefined,
        imageWidth: cert.image_width ?? undefined,
        imageHeight: cert.image_height ?? undefined,
      }}
      submitLabel="Update"
    />
  );
}
