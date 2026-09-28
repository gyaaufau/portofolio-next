"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { draftEntityId, slugify } from "@/lib/cms-content";
import { publishDraftBatch } from "@/lib/cms-publish";
import { createAdminClient } from "@/utils/supabase/admin";

type DraftKind = "app" | "note" | "certificate" | "experience" | "skills" | "section" | "settings";
type DraftRecord = { kind: DraftKind; entity_id: string; payload: Record<string, string>; title: string };

function routeFor(kind: DraftKind, id: string) {
  if (kind === "app") return `/admin/content/apps/${id}`;
  if (kind === "note") return `/admin/content/notes/${id}`;
  if (kind === "section") return "/admin/sections";
  if (kind === "certificate") return `/admin/certificates/${id}/edit`;
  if (kind === "experience") return `/admin/work-experience/${id}/edit`;
  return "/admin/content";
}

function readPayload(formData: FormData): Record<string, string> {
  return Object.fromEntries([...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

async function stageDraft(kind: DraftKind, id: string, formData: FormData) {
  await requireAdmin();
  const payload = readPayload(formData);
  const entityId = id === "new" ? (kind === "experience" ? crypto.randomUUID() : draftEntityId(payload.title || payload.role || payload.label || "")) : id;
  const title = (payload.title || payload.role || payload.label || "").trim();
  if (!title) throw new Error("A title is required.");
  const db = createAdminClient();
  if (id === "new" && (kind === "app" || kind === "note" || kind === "certificate")) {
    const table = kind === "app" ? "app" : kind === "note" ? "cms_note" : "certificate";
    const existing = await db.from(table).select("id").eq("id", entityId).maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) throw new Error("An entry with this title already exists.");
    const staged = await db.from("cms_draft").select("id").eq("kind", kind).eq("entity_id", entityId).maybeSingle();
    if (staged.error) throw new Error(staged.error.message);
    if (staged.data) throw new Error("A draft with this title already exists. Open it from the content library.");
  }
  const { error } = await db.from("cms_draft").upsert({ kind, entity_id: entityId, title, payload, updated_at: new Date().toISOString() }, { onConflict: "kind,entity_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  return entityId;
}

export async function saveCmsDraft(kind: DraftKind, id: string, formData: FormData) {
  let entityId: string;
  try { entityId = await stageDraft(kind, id, formData); }
  catch (failure) { const message = failure instanceof Error ? failure.message : "Unable to save draft"; redirect(`${routeFor(kind,id)}?error=${encodeURIComponent(message)}`); }
  redirect(`${routeFor(kind, entityId)}?saved=1`);
}

async function publishRecord(draft: DraftRecord) {
  const db = createAdminClient();
  const p = draft.payload;
  const id = draft.entity_id;
  let error: { message: string } | null = null;

  if (draft.kind === "app") {
    const slug = slugify(p.slug || p.title || id);
    if (!p.title?.trim() || !slug) throw new Error("App title and slug are required.");
    const existing = await db.from("app").select("sort_order,other_url,other_url_label,app_icon_alt,thumbnail_alt,app_icon_src,thumbnail_src").eq("id",id).maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    const record = {
      id, slug, title: p.title.trim(), tagline: p.tagline || "", description: p.description || "",
      featured: p.featured === "on", app_type: p.appType || "mobile", work_type: p.workType || "personal",
      period: p.period || "", period_short: p.periodShort || "", sort_order: Number(p.sortOrder ?? existing.data?.sort_order ?? 0),
      category: p.category || "", release_year: Number(p.releaseYear || 0) || null,
      app_store_url: p.appStoreUrl || null, play_store_url: p.playStoreUrl || null, website_url: p.websiteUrl || null,
      github_url: p.githubUrl || null, other_url: p.otherUrl ?? existing.data?.other_url ?? null, other_url_label: p.otherUrlLabel ?? existing.data?.other_url_label ?? null,
      app_icon_src: p.appIconSrc || existing.data?.app_icon_src || "/data/myself/me.webp", app_icon_alt: p.appIconAlt ?? existing.data?.app_icon_alt ?? "",
      thumbnail_src: p.thumbnailSrc || existing.data?.thumbnail_src || "/data/myself/me.webp", thumbnail_alt: p.thumbnailAlt ?? existing.data?.thumbnail_alt ?? "",
      stack: (p.stack || "").split(",").map((v) => v.trim()).filter(Boolean),
      highlights: (p.highlights || "").split("\n").map((v) => v.trim()).filter(Boolean),
      publication_status: "published", updated_at: new Date().toISOString(),
    };
    let screenshots: Array<{ app_id: string; src: string; alt: string; order: number; width: number; height: number }> | null = null;
    if (p.screenshotCount !== undefined) {
      const count = Number(p.screenshotCount || 0);
      if (!Number.isInteger(count) || count < 0 || count > 50) throw new Error("Invalid screenshot count.");
      screenshots = Array.from({ length: count }, (_, index) => ({
        app_id: id, src: p[`screenshotSrc_${index}`] || "", alt: p[`screenshotAlt_${index}`] || "",
        order: index, width: 0, height: 0,
      })).filter((item) => item.src);
    }
    const result = await db.rpc("cms_publish_app", { p_id: id, p_record: record, p_screenshots: screenshots });
    error = result.error;
  } else if (draft.kind === "note") {
    const slug = slugify(p.slug || p.title || id);
    if (!p.title?.trim() || !slug || !p.body?.trim()) throw new Error("Note title, slug, and body are required.");
    const existing = await db.from("cms_note").select("published_at").eq("id", id).maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    const result = await db.from("cms_note").upsert({
      id, slug, title: p.title.trim(), summary: p.summary || "", body: p.body,
      tags: (p.tags || "").split(",").map((v) => v.trim()).filter(Boolean), cover_src: p.coverSrc || null,
      publication_status: "published", published_at: existing.data?.published_at ?? new Date().toISOString(), updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    error = result.error;
  } else if (draft.kind === "certificate") {
    if (!p.title?.trim() || !p.issuer?.trim() || !p.issued?.trim()) throw new Error("Certificate title, issuer, and issue date are required.");
    const result = await db.from("certificate").upsert({
      id, title:p.title.trim(), featured:p.featured === "on", issuer:p.issuer.trim(), issued:p.issued.trim(), type:p.type || "Certificate",
      summary:p.summary || "", details:(p.details || "").split("\n").filter(Boolean), relevance:p.relevance || "",
      issuer_notes:(p.issuerNotes || "").split("\n").filter(Boolean), image_src:p.imageSrc || null, image_alt:p.imageAlt || null,
      image_width:Number(p.imageWidth || 0) || null, image_height:Number(p.imageHeight || 0) || null,
      publication_status:"published", updated_at:new Date().toISOString(),
    }, { onConflict:"id" });
    error = result.error;
  } else if (draft.kind === "experience") {
    if (!p.role?.trim() || !p.company?.trim()) throw new Error("Role and company are required.");
    const result = await db.from("work_experience").upsert({
      id, role:p.role.trim(), company:p.company.trim(), location:p.location || "",
      start:p.start || "", end:p.end || "", period:p.period || "",
      sort_order:Number(p.sortOrder || 0), summary:p.summary || "",
      highlights:(p.highlights || "").split("\n").filter(Boolean),
      publication_status:"published", updated_at:new Date().toISOString(),
    }, { onConflict:"id" });
    error = result.error;
  } else if (draft.kind === "section") {
    const result = await db.from("cms_section").upsert({
      id, label: p.label || id, anchor: p.anchor || `#${id}`, sort_order: Number(p.sortOrder || 0),
      visible: p.visible === "on", settings: {
        headline: p.headline || "", subheadline: p.subheadline || "", cta: p.cta || "",
        heroAppId: p.heroAppId || "", metrics: (() => { try { const value: unknown = JSON.parse(p.metrics || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } })(),
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    error = result.error;
  } else {
    throw new Error(`Publishing ${draft.kind} drafts is not available.`);
  }
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(routeFor(draft.kind, id));
}

async function removeDraft(draft: DraftRecord) {
  const db = createAdminClient();
  const result = await db.from("cms_draft").delete().eq("kind",draft.kind).eq("entity_id",draft.entity_id);
  if (result.error) throw new Error(result.error.message);
}

export async function publishCmsDraft(kind: DraftKind, id: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db.from("cms_draft").select("kind,entity_id,payload,title").eq("kind", kind).eq("entity_id", id).single();
  if (error || !data) redirect(`${routeFor(kind, id)}?error=missing-draft`);
  const outcome = await publishDraftBatch([data as DraftRecord],publishRecord,removeDraft,(draft) => draft.entity_id);
  if (outcome.failed.length) redirect(`${routeFor(kind, id)}?error=${encodeURIComponent(outcome.failed[0].message)}`);
  redirect(`${routeFor(kind, id)}?published=1`);
}

export async function saveAndPublishCmsDraft(kind: DraftKind, id: string, formData: FormData) {
  let entityId: string;
  try { entityId = await stageDraft(kind, id, formData); }
  catch (failure) { const message = failure instanceof Error ? failure.message : "Unable to save draft"; redirect(`${routeFor(kind,id)}?error=${encodeURIComponent(message)}`); }
  await publishCmsDraft(kind, entityId);
}

export async function publishAllCmsDrafts() {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db.from("cms_draft").select("kind,entity_id,payload,title").order("updated_at");
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  const outcome = await publishDraftBatch((data ?? []) as DraftRecord[],publishRecord,removeDraft,(draft) => `${draft.kind}:${draft.entity_id}`);
  const details = outcome.failed.slice(0, 3).map((failure) => `${failure.id}: ${failure.message}`).join(" | ");
  redirect(`/admin?published=${outcome.succeeded}&failed=${outcome.failed.length}&details=${encodeURIComponent(details)}`);
}

export async function saveCmsSections(formData: FormData) {
  await requireAdmin();
  const value = formData.get("sections");
  const parsed: unknown = JSON.parse(String(value || "[]"));
  if (!Array.isArray(parsed) || parsed.length > 30) throw new Error("Invalid sections.");
  const db = createAdminClient();
  for (const [index, item] of parsed.entries()) {
    if (!item || typeof item !== "object") throw new Error("Invalid section.");
    const section = item as Record<string, unknown>;
    const id = String(section.id || "");
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid section ID.");
    const payload = {
      label: String(section.label || id), anchor: String(section.anchor || `#${id}`),
      sortOrder: String(index), visible: section.visible ? "on" : "",
      headline: String(section.headline || ""), subheadline: String(section.subheadline || ""), cta: String(section.cta || ""),
      heroAppId: String(section.heroAppId || ""), metrics: JSON.stringify(Array.isArray(section.metrics) ? section.metrics : []),
    };
    const { error } = await db.from("cms_draft").upsert({ kind: "section", entity_id: id, title: payload.label, payload, updated_at: new Date().toISOString() }, { onConflict: "kind,entity_id" });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/sections");
  redirect("/admin/sections?saved=1");
}
