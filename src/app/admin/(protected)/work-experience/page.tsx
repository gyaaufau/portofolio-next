import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { deleteWorkExperience } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminWorkExperiencePage() {
  const supabase = createClient(await cookies());
  const { data: experiences } = await supabase
    .from("work_experience")
    .select("id, company, role, period, sort_order")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">manage</p>
          <h1 className="text-2xl font-bold tracking-tight">Work Experience</h1>
        </div>
        <Button render={<Link href="/admin/work-experience/new" />}>
          <Plus className="size-4" />
          New Experience
        </Button>
      </div>

      <div className="space-y-2">
        {(experiences ?? []).map((exp) => (
          <Card key={exp.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground">{exp.role}</h3>
                <p className="text-xs text-muted-foreground">{exp.company} &middot; {exp.period}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" render={<Link href={`/admin/work-experience/${exp.id}/edit`} />}>
                  <Pencil className="size-4" />
                </Button>
                <form action={async () => { "use server"; await deleteWorkExperience(exp.id); }}>
                  <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!experiences || experiences.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No work experience yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
