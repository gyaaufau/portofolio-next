import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Plus, Star, Trash2, Pencil } from "lucide-react";
import { toggleAppFeatured, deleteApp } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminAppsPage() {
  const supabase = createClient(await cookies());
  const { data: apps } = await supabase
    .from("app")
    .select("id, title, slug, app_type, work_type, featured, app_icon_src")
    .order("sort_order", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">manage</p>
          <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
        </div>
        <Link
          href="/admin/apps/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          New App
        </Link>
      </div>

      <div className="space-y-2">
        {(apps ?? []).map((app) => (
          <div
            key={app.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border group"
          >
            <Image
              src={app.app_icon_src}
              alt=""
              width={40}
              height={40}
              className="rounded-lg size-10 object-cover border border-border shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground truncate">{app.title}</h3>
              <p className="text-xs text-muted-foreground">{app.app_type} &middot; {app.work_type}</p>
            </div>
            <div className="flex items-center gap-2">
              <form action={async () => {
                "use server";
                await toggleAppFeatured(app.id);
              }}>
                <button
                  type="submit"
                  className={`p-2 rounded-lg transition-colors ${app.featured ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`}
                  title={app.featured ? "Remove from featured" : "Add to featured"}
                >
                  <Star className="size-4" fill={app.featured ? "currentColor" : "none"} />
                </button>
              </form>
              <Link
                href={`/admin/apps/${app.id}/edit`}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Pencil className="size-4" />
              </Link>
              <form action={async () => {
                "use server";
                await deleteApp(app.id);
              }}>
                <button
                  type="submit"
                  className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
        {(!apps || apps.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No apps yet. Create your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
