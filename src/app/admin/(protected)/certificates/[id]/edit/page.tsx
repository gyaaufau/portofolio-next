import { notFound } from "next/navigation";
import { getCmsDraft } from "@/lib/cms-data";
import { createAdminClient } from "@/utils/supabase/admin";
import { publishCmsDraft, saveAndPublishCmsDraft, saveCmsDraft } from "@/app/admin/cms-actions";
import { CertForm } from "../../cert-form";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  const [{ data: cert }, draft] = await Promise.all([
    db.from("certificate").select("*").eq("id",id).maybeSingle(),
    getCmsDraft("certificate",id),
  ]);
  if (!cert && !draft) notFound();
  const value = (key: string, column = key) => draft?.[key] ?? (cert?.[column] as string | undefined) ?? "";
  return <CertForm action={saveAndPublishCmsDraft.bind(null,"certificate",id)} draftAction={saveCmsDraft.bind(null,"certificate",id)} publishAction={draft ? publishCmsDraft.bind(null,"certificate",id) : undefined} initialData={{
    title:value("title"), issuer:value("issuer"), issued:value("issued"), type:value("type") || "Certificate",
    summary:value("summary"), details:draft ? (draft.details || "").split("\n") : cert?.details || [],
    relevance:value("relevance"), issuerNotes:draft ? (draft.issuerNotes || "").split("\n") : cert?.issuer_notes || [],
    featured:draft ? draft.featured === "on" : cert?.featured || false, imageSrc:value("imageSrc","image_src"), imageAlt:value("imageAlt","image_alt"),
    imageWidth:Number(value("imageWidth","image_width") || 0), imageHeight:Number(value("imageHeight","image_height") || 0),
  }} submitLabel="Save and publish" />;
}
