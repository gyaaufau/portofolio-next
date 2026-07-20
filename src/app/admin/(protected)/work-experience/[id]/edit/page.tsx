import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateWorkExperience } from "@/app/admin/actions";
import { WorkForm } from "../../work-form";

export const dynamic = "force-dynamic";

export default async function EditWorkExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exp = await prisma.workExperience.findUnique({ where: { id } });
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
        sortOrder: exp.sortOrder,
        summary: exp.summary,
        highlights: exp.highlights,
      }}
      submitLabel="Update"
    />
  );
}
