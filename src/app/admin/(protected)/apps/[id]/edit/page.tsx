import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { updateApp, updateScreenshots } from "@/app/admin/actions";
import { AppForm } from "../../app-form";
import { ScreenshotUpload } from "@/components/screenshot-upload";

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

  const slug = app.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "app";
  const screenshots = (app.app_screenshot ?? [])
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
    .map((s: { id: string; src: string; alt: string; width: number; height: number; order: number }) => ({
      id: s.id,
      src: s.src,
      alt: s.alt || "",
      width: s.width,
      height: s.height,
      order: s.order,
    }));

  return (
    <div className="space-y-10">
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
          slug,
        }}
        submitLabel="Update"
      />

      <div className="divider-pixel" />

      <form
        action={async (formData: FormData) => {
          "use server";
          await updateScreenshots(id, formData);
        }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold">Screenshots</h2>
        <p className="text-sm text-muted-foreground">Drag to reorder. Images upload directly to storage.</p>
        <ScreenshotUpload
          bucket="apps"
          path={`${slug}/screenshots`}
          initialScreenshots={screenshots}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save Screenshots
          </button>
        </div>
      </form>
    </div>
  );
}
