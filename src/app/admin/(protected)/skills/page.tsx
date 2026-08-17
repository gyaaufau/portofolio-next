import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateSkillCategory } from "@/app/admin/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const supabase = createClient(await cookies());
  const { data: categories } = await supabase.from("skill_category").select("*");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">edit</p>
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">One item per line.</p>
      </div>

      {(categories ?? []).map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle className="capitalize">
              {cat.name === "softSkills" ? "Soft Skills" : cat.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => { "use server"; await updateSkillCategory(cat.id, formData); }} className="space-y-4">
              <Textarea
                name="items"
                defaultValue={cat.items.join("\n")}
                rows={6}
                className="font-mono"
              />
              <div className="flex justify-end">
                <Button type="submit">
                  Save {cat.name === "softSkills" ? "Soft Skills" : cat.name}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
