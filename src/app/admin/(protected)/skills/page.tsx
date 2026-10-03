import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateSkillCategory } from "@/app/admin/actions";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { CmsSaveForm, CmsSubmitButton } from "@/components/cms-save-form";
import { createAdminClient } from "@/utils/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const supabase = createClient(await cookies());
  const { data: categories, error } = await supabase.from("skill_category").select("*");
  if (error) throw new Error(error.message);
  const drafts = await createAdminClient().from("cms_draft").select("entity_id,payload").eq("kind","skills");
  if (drafts.error) throw new Error(drafts.error.message);
  const draftMap = new Map((drafts.data ?? []).map((draft) => [draft.entity_id, draft.payload as Record<string,string>]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">edit</p>
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1><Link href="/admin/content?type=skills" className="cms-button">← Skills</Link>
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
            <CmsSaveForm action={async (formData) => { "use server"; await updateSkillCategory(cat.id, formData); }} className="space-y-4">
              {draftMap.has(cat.id) && <p role="status">Unsaved changes restored. Save to apply them.</p>}
              <Textarea
                name="items"
                defaultValue={draftMap.get(cat.id)?.items ?? cat.items.join("\n")}
                rows={6}
                className="font-mono"
              />
              <div className="flex justify-end">
                <CmsSubmitButton>
                  Save {cat.name === "softSkills" ? "Soft Skills" : cat.name}
                </CmsSubmitButton>
              </div>
            </CmsSaveForm>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
