import { prisma } from "@/lib/prisma";
import { updateSkillCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const categories = await prisma.skillCategory.findMany();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">edit</p>
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">One item per line.</p>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="p-5 rounded-xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-semibold capitalize">{cat.name === "softSkills" ? "Soft Skills" : cat.name}</h2>
          <form action={async (formData) => { "use server"; await updateSkillCategory(cat.id, formData); }} className="space-y-4">
            <textarea
              name="items"
              defaultValue={cat.items.join("\n")}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
            />
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Save {cat.name === "softSkills" ? "Soft Skills" : cat.name}
              </button>
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}
