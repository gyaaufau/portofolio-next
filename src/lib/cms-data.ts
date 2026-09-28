import "server-only";
import { normalizeContentRows, type ContentRow } from "@/lib/cms-content";
import { createAdminClient } from "@/utils/supabase/admin";

export async function getCmsLibrary(): Promise<ContentRow[]> {
  const db = createAdminClient();
  const [apps, notes, certificates, experience, drafts] = await Promise.all([
    db.from("app").select("id,title,updated_at,publication_status"),
    db.from("cms_note").select("id,title,updated_at,publication_status"),
    db.from("certificate").select("id,title,updated_at,publication_status"),
    db.from("work_experience").select("id,role,updated_at,publication_status"),
    db.from("cms_draft").select("id,kind,entity_id,title,updated_at"),
  ]);
  for (const result of [apps, notes, certificates, experience, drafts]) if (result.error) throw new Error(result.error.message);
  const staged = drafts.data ?? [];
  return [
    ...normalizeContentRows(apps.data ?? [], staged, "app"),
    ...normalizeContentRows(notes.data ?? [], staged, "note"),
    ...normalizeContentRows(certificates.data ?? [], staged, "certificate"),
    ...normalizeContentRows((experience.data ?? []).map((row) => ({ ...row, title: row.role })), staged, "experience"),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCmsDraft(kind: string, id: string): Promise<Record<string, string> | null> {
  const db = createAdminClient();
  const { data, error } = await db.from("cms_draft").select("payload").eq("kind", kind).eq("entity_id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.payload as Record<string, string>) ?? null;
}
