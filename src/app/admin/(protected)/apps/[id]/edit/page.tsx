import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { updateApp } from "@/app/admin/actions";
import { AppForm } from "../../app-form";

export const dynamic = "force-dynamic";

export default async function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: app } = await supabase
    .from("app")
    .select("*, app_screenshot(*)")
    .eq("id", id)
    .single();

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
        appType: app.app_type,
        workType: app.work_type,
        period: app.period,
        periodShort: app.period_short,
        sortOrder: app.sort_order,
        featured: app.featured,
        appStoreUrl: app.app_store_url ?? undefined,
        playStoreUrl: app.play_store_url ?? undefined,
        websiteUrl: app.website_url ?? undefined,
        githubUrl: app.github_url ?? undefined,
        otherUrl: app.other_url ?? undefined,
        otherUrlLabel: app.other_url_label ?? undefined,
        appIconSrc: app.app_icon_src,
        appIconAlt: app.app_icon_alt,
        thumbnailSrc: app.thumbnail_src,
        thumbnailAlt: app.thumbnail_alt,
        stack: app.stack,
        highlights: app.highlights,
        sections: app.sections as unknown,
      }}
      submitLabel="Update"
    />
  );
}
