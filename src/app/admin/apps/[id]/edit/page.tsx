import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateApp } from "../../../actions";
import { AppForm } from "../../app-form";

export const dynamic = "force-dynamic";

export default async function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await prisma.app.findUnique({
    where: { id },
    include: { screenshots: true },
  });

  if (!app) notFound();

  return (
    <AppForm
      action={async (formData: FormData) => {
        "use server";
        await updateApp(id, formData);
      }}
      initialData={{
        title: app.title,
        tagline: app.tagline,
        description: app.description,
        appType: app.appType,
        workType: app.workType,
        period: app.period,
        periodShort: app.periodShort,
        sortOrder: app.sortOrder,
        featured: app.featured,
        appStoreUrl: app.appStoreUrl ?? undefined,
        playStoreUrl: app.playStoreUrl ?? undefined,
        websiteUrl: app.websiteUrl ?? undefined,
        githubUrl: app.githubUrl ?? undefined,
        otherUrl: app.otherUrl ?? undefined,
        otherUrlLabel: app.otherUrlLabel ?? undefined,
        appIconSrc: app.appIconSrc,
        appIconAlt: app.appIconAlt,
        thumbnailSrc: app.thumbnailSrc,
        thumbnailAlt: app.thumbnailAlt,
        stack: app.stack,
        highlights: app.highlights,
        sections: app.sections as unknown,
      }}
      submitLabel="Update"
    />
  );
}
