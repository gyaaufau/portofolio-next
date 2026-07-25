import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { deleteWorkExperience } from "@/app/admin/actions";

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
        <Link href="/admin/work-experience/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="size-4" /> New Experience
        </Link>
      </div>

      <div className="space-y-2">
        {(experiences ?? []).map((exp) => (
          <div key={exp.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground">{exp.role}</h3>
              <p className="text-xs text-muted-foreground">{exp.company} &middot; {exp.period}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/work-experience/${exp.id}/edit`} className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Pencil className="size-4" />
              </Link>
              <form action={async () => { "use server"; await deleteWorkExperience(exp.id); }}>
                <button type="submit" className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
        {(!experiences || experiences.length === 0) && <div className="text-center py-12 text-muted-foreground"><p>No work experience yet.</p></div>}
      </div>
    </div>
  );
}
