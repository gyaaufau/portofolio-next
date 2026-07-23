import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { updateWorkExperience } from "@/app/admin/actions";
import { WorkForm } from "../../work-form";

export const dynamic = "force-dynamic";

export default async function EditWorkExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: exp } = await supabase.from("work_experience").select("*").eq("id", id).single();
  if (!exp) notFound();

  return (
    <WorkForm
      action={async (formData: FormData) => { "use server"; await updateWorkExperience(id, formData); }}
      initialData={{
        company: exp.company,
        location: exp.location,
        role: exp.role,
        start: exp.start,
        end: exp.end,
        period: exp.period,
        sortOrder: exp.sort_order,
        summary: exp.summary,
        highlights: exp.highlights,
      }}
      submitLabel="Update"
    />
  );
}
