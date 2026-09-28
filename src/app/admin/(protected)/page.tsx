import Link from "next/link";
import { getCmsLibrary } from "@/lib/cms-data";
import { publishAllCmsDrafts } from "@/app/admin/cms-actions";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ published?: string; failed?: string; error?: string; details?: string }> }) {
  const params = await searchParams;
  const rows = await getCmsLibrary();
  const db = createAdminClient();
  const [{ data: sections, error: sectionsError }, { data: pendingDrafts, error: draftsError }] = await Promise.all([
    db.from("cms_section").select("id,label,visible").order("sort_order"),
    db.from("cms_draft").select("kind,entity_id,title,updated_at").order("updated_at", { ascending: false }),
  ]);
  if (sectionsError) throw new Error(sectionsError.message);
  if (draftsError) throw new Error(draftsError.message);
  const published = rows.filter((row) => row.hasPublished);
  const drafts = rows.filter((row) => row.status === "draft");
  const pendingCount = pendingDrafts?.length ?? 0;
  return <div className="cms-overview">
    <div className="cms-page-head"><div><div className="cms-eyebrow">● Good to see you</div><h1>Keep the portfolio alive.</h1><p>{pendingCount ? `${pendingCount} draft${pendingCount === 1 ? "" : "s"} waiting to ship.` : "Everything is up to date."}</p></div><div className="cms-head-actions"><Link href="/" target="_blank" className="cms-button">Preview site ↗</Link><form action={publishAllCmsDrafts}><button className="cms-button cms-button-primary" disabled={!pendingCount}>Publish changes</button></form></div></div>
    {(params.published || params.failed || params.error) && <div className="cms-flash" role="status">{params.error ? params.error : `${params.published || 0} published. ${params.failed || 0} retained as drafts after an error.`}{params.details && <p>{params.details}</p>}</div>}
    <div className="cms-stats"><Link href="/admin/content?status=published" className="cms-stat cms-stat-dark"><span className="cms-mono">Published</span><strong>{published.length.toString().padStart(2,"0")}</strong><small>Entries in the CMS</small></Link><Link href="/admin/content?status=draft" className="cms-stat cms-stat-yellow"><span className="cms-mono">Drafts</span><strong>{pendingCount.toString().padStart(2,"0")}</strong><small>Waiting to ship</small></Link><Link href="/admin/sections" className="cms-stat"><span className="cms-mono">Visible sections</span><strong>{(sections ?? []).filter((section) => section.visible).length.toString().padStart(2,"0")}</strong><small>Configured in the CMS</small></Link></div>
    <div className="cms-overview-grid"><section className="cms-card"><div className="cms-card-heading"><h2>Recent content</h2><Link href="/admin/content">View all ↗</Link></div><div className="cms-recent">{rows.slice(0,6).map((row,index) => <Link key={`${row.kind}-${row.id}`} href={row.href} className="cms-recent-row"><span className="cms-row-number">{String(index+1).padStart(2,"0")}</span><span className="cms-row-name"><strong>{row.title}</strong><small>{row.kind.toUpperCase()} · {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "NEW"}</small></span><span className={`cms-status ${row.status === "draft" ? "cms-status-draft" : ""}`}>{row.status}</span></Link>)}{!rows.length && <p className="cms-empty">No content yet. Create an app or note to get started.</p>}</div></section><aside className="cms-overview-side"><div className="cms-card"><div className="cms-card-heading"><span className="cms-mono">Section visibility</span><Link href="/admin/sections">Manage ↗</Link></div>{(sections ?? []).slice(0,4).map((section) => <div className="cms-visibility-row" key={section.id}><span>{section.label}</span><span className={section.visible ? "is-on" : ""}>{section.visible ? "On" : "Off"}</span></div>)}</div><div className="cms-next-card"><span className="cms-mono">Pick up where you left off</span><h2>{drafts[0]?.title || "Your next story starts here."}</h2><Link className="cms-button cms-button-primary" href={drafts[0]?.href || "/admin/content"}>{drafts[0] ? "Continue editing →" : "Browse content →"}</Link></div></aside></div>
  </div>;
}
