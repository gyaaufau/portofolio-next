import { createAdminClient } from "@/utils/supabase/admin";
import { SectionsEditor, type SectionItem } from "./sections-editor";
import { publishAllCmsDrafts } from "@/app/admin/cms-actions";

export default async function SectionsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const notice = await searchParams;
  const db = createAdminClient();
  const [sections, drafts, apps] = await Promise.all([
    db.from("cms_section").select("*").order("sort_order"),
    db.from("cms_draft").select("entity_id,payload").eq("kind","section"),
    db.from("app").select("id,title").eq("publication_status", "published").order("title"),
  ]);
  if (sections.error) throw new Error(sections.error.message);
  if (drafts.error || apps.error) throw new Error(drafts.error?.message ?? apps.error?.message);
  const draftMap = new Map((drafts.data ?? []).map((draft) => [draft.entity_id,draft.payload as Record<string,string>]));
  const initial: SectionItem[] = (sections.data ?? []).map((section) => { const draft = draftMap.get(section.id); const settings = section.settings as Record<string,unknown> ?? {}; const storedMetrics = Array.isArray(settings.metrics) ? settings.metrics : []; let draftMetrics: unknown = storedMetrics; try { draftMetrics = draft?.metrics ? JSON.parse(draft.metrics) : storedMetrics; } catch {} return { id:section.id, label:draft?.label ?? section.label, anchor:draft?.anchor ?? section.anchor, visible:draft ? draft.visible === "on" : section.visible, headline:draft?.headline ?? String(settings.headline ?? ""), subheadline:draft?.subheadline ?? String(settings.subheadline ?? ""), cta:draft?.cta ?? String(settings.cta ?? ""), heroAppId:draft?.heroAppId ?? String(settings.heroAppId ?? ""), metrics:Array.isArray(draftMetrics) ? draftMetrics.filter((metric): metric is { value:string; label:string } => Boolean(metric && typeof metric === "object" && typeof (metric as {value?:unknown}).value === "string" && typeof (metric as {label?:unknown}).label === "string")) : [] }; }).sort((a,b) => Number(draftMap.get(a.id)?.sortOrder ?? sections.data?.find((row) => row.id === a.id)?.sort_order ?? 0) - Number(draftMap.get(b.id)?.sortOrder ?? sections.data?.find((row) => row.id === b.id)?.sort_order ?? 0));
  return <div><div className="cms-page-head"><div><div className="cms-eyebrow">Sections</div><h1>Landing page sections</h1><p>{initial.length} sections · {initial.filter((section) => section.visible).length} visible. Drag to reorder, toggle to hide.</p></div><form action={publishAllCmsDrafts}><button type="submit" className="cms-button cms-button-primary" disabled={!drafts.data?.length}>Publish changes</button></form></div>{notice.saved && <div className="cms-flash" role="status">Section drafts saved. Publish when ready.</div>}<SectionsEditor initial={initial} apps={apps.data ?? []} /></div>;
}
