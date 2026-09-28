import { notFound } from "next/navigation";
import { getCmsDraft } from "@/lib/cms-data";
import { createAdminClient } from "@/utils/supabase/admin";
import { publishCmsDraft, saveAndPublishCmsDraft, saveCmsDraft } from "@/app/admin/cms-actions";
import { WorkForm } from "../../work-form";

export default async function EditWorkExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  const [{ data: exp }, draft] = await Promise.all([
    db.from("work_experience").select("*").eq("id",id).maybeSingle(),
    getCmsDraft("experience",id),
  ]);
  if (!exp && !draft) notFound();
  const value = (key: string, column = key) => draft?.[key] ?? (exp?.[column] as string | undefined) ?? "";
  return <WorkForm action={saveAndPublishCmsDraft.bind(null,"experience",id)} draftAction={saveCmsDraft.bind(null,"experience",id)} publishAction={draft ? publishCmsDraft.bind(null,"experience",id) : undefined} initialData={{
    company:value("company"), location:value("location"), role:value("role"), start:value("start"),
    end:value("end"), period:value("period"), sortOrder:Number(value("sortOrder","sort_order") || 0),
    summary:value("summary"), highlights:draft ? (draft.highlights || "").split("\n") : exp?.highlights || [],
  }} submitLabel="Save and publish" />;
}
