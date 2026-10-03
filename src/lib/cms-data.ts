import "server-only";
import { normalizeContentRows, type ContentRow } from "@/lib/cms-content";
import { createAdminClient } from "@/utils/supabase/admin";

export async function getCmsLibrary(): Promise<ContentRow[]> {
  const db = createAdminClient();
  const [apps, notes, certificates, experience, drafts, skills] = await Promise.all([
    db.from("app").select("id,title,updated_at,publication_status,app_icon_src,app_type,work_type,featured,has_privacy_policy,has_account_deletion"),
    db.from("cms_note").select("id,title,updated_at,publication_status"),
    db.from("certificate").select("id,title,updated_at,publication_status"),
    db.from("work_experience").select("id,role,updated_at,publication_status"),
    db.from("cms_draft").select("id,kind,entity_id,title,updated_at,payload"),
    db.from("skill_category").select("id,name,items"),
  ]);
  for (const result of [apps, notes, certificates, experience, drafts, skills]) if (result.error) throw new Error(result.error.message);
  const staged = drafts.data ?? [];
  return [
    ...normalizeContentRows(apps.data ?? [], staged, "app").map((row) => {
      const app = apps.data?.find((app) => app.id === row.id);
      const draft = staged.find((draft) => draft.kind === "app" && draft.entity_id === row.id)?.payload as Record<string,string> | undefined;
      return { ...row, icon: draft?.appIconSrc ?? app?.app_icon_src, platform: draft?.appType ?? app?.app_type, workType: draft?.workType ?? app?.work_type, featured: draft ? draft.featured === "on" : app?.featured, privacy: draft?.hasPrivacyPolicy !== undefined ? draft.hasPrivacyPolicy === "on" : app?.has_privacy_policy, accountDeletion: draft?.hasAccountDeletion !== undefined ? draft.hasAccountDeletion === "on" : app?.has_account_deletion };
    }),
    ...normalizeContentRows(notes.data ?? [], staged, "note"),
    ...normalizeContentRows(certificates.data ?? [], staged, "certificate"),
    ...normalizeContentRows((experience.data ?? []).map((row) => ({ ...row, title: row.role })), staged, "experience"),
    ...normalizeContentRows((skills.data ?? []).map((row) => ({ id:row.id, title:row.name })), staged, "skills").map((row) => ({ ...row, summary: (skills.data?.find((skill) => skill.id === row.id)?.items ?? []).join(" · ") })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCmsDraft(kind: string, id: string): Promise<Record<string, string> | null> {
  const db = createAdminClient();
  const { data, error } = await db.from("cms_draft").select("payload").eq("kind", kind).eq("entity_id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.payload as Record<string, string>) ?? null;
}
