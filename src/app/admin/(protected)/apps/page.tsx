import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Plus, Star, Trash2, Pencil } from "lucide-react";
import { toggleAppFeatured, deleteApp } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminAppsPage() {
  const supabase = createClient(await cookies());
  const { data: apps } = await supabase
    .from("app")
    .select("id, title, slug, app_type, work_type, featured, app_icon_src")
    .order("sort_order", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">manage</p>
          <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
        </div>
        <Button render={<Link href="/admin/apps/new" />}>
          <Plus className="size-4" />
          New App
        </Button>
      </div>

      <div className="space-y-2">
        {(apps ?? []).map((app) => (
          <Card key={app.id}>
            <CardContent className="flex items-center gap-4 p-4">
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
              <div className="flex items-center gap-1">
                <form action={async () => {
                  "use server";
                  await toggleAppFeatured(app.id);
                }}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className={app.featured ? "text-primary" : "text-muted-foreground"}
                    title={app.featured ? "Remove from featured" : "Add to featured"}
                  >
                    <Star className="size-4" fill={app.featured ? "currentColor" : "none"} />
                  </Button>
                </form>
                <Button variant="ghost" size="icon" render={<Link href={`/admin/apps/${app.id}/edit`} />}>
                  <Pencil className="size-4" />
                </Button>
                <form action={async () => {
                  "use server";
                  await deleteApp(app.id);
                }}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
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
