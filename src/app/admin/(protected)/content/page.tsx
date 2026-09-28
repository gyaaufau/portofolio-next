import Link from "next/link";
import { getCmsLibrary } from "@/lib/cms-data";
import { publishAllCmsDrafts } from "@/app/admin/cms-actions";

type Params = { q?: string; status?: string; type?: string; page?: string };
export default async function ContentPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const rows = await getCmsLibrary();
  const draftCount = rows.filter((row) => row.status === "draft").length;
  const filtered = rows.filter((row) => (!params.status || row.status === params.status) && (!params.type || row.kind === params.type) && (!params.q || row.title.toLowerCase().includes(params.q.toLowerCase())));
  const page = Math.max(1, Number(params.page) || 1);
  const visible = filtered.slice((page - 1) * 12, page * 12);
  const query = (overrides: Params) => { const next = new URLSearchParams(); for (const [key,value] of Object.entries({ ...params, ...overrides })) if (value) next.set(key,value); return `/admin/content?${next}`; };
  return <div>
    <div className="cms-page-head"><div><div className="cms-eyebrow">All content</div><h1>Content library</h1><p>{rows.length} entries across apps, notes, experience and certificates.</p></div><div className="cms-head-actions"><Link href="/admin/content/apps/new" className="cms-button cms-button-primary">+ New app</Link><Link href="/admin/content/notes/new" className="cms-button">+ New note</Link><Link href="/admin/content/lists" className="cms-button">Manage lists</Link></div></div>
    <div className="cms-content-toolbar"><form action="/admin/content" className="cms-search-form"><input className="cms-search" name="q" type="search" placeholder="Search content..." defaultValue={params.q || ""} aria-label="Search content" /><button className="cms-button" type="submit">Search</button></form><div className="cms-pills">{[["","All"],["draft","Drafts"],["published","Published"]].map(([status,label]) => <Link key={status} href={query({ status, page:"1" })} className={`cms-pill${(params.status || "") === status ? " is-active" : ""}`}>{label}{status === "draft" && <span> {draftCount}</span>}</Link>)}</div></div>
    <div className="cms-type-filters">{[["","All types"],["app","Apps"],["note","Notes"],["experience","Experience"],["certificate","Certificates"]].map(([type,label]) => <Link key={type} href={query({ type, page:"1" })} className={`cms-pill${(params.type || "") === type ? " is-active" : ""}`}>{label}</Link>)}</div>
    {draftCount > 0 && <div className="cms-publish-bar"><span><strong>{draftCount} draft{draftCount === 1 ? "" : "s"}</strong> waiting to publish</span><form action={publishAllCmsDrafts}><button type="submit" className="cms-button cms-button-primary">Publish changes</button></form></div>}
    <div className="cms-content-list"><div className="cms-list-head"><span>Title</span><span>Type</span><span>Status</span><span>Updated</span></div>{visible.map((row) => <Link className="cms-content-row" href={row.href} key={`${row.kind}-${row.id}`}><span className="cms-row-title"><strong>{row.title}</strong><small>{row.kind}/{row.id}</small></span><span className="cms-kind">{row.kind}</span><span><span className={`cms-status ${row.status === "draft" ? "cms-status-draft" : ""}`}>{row.status}</span></span><span className="cms-updated">{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "—"}</span></Link>)}{!visible.length && <div className="cms-empty-state"><strong>No entries match.</strong><p>Try another search or filter, or write something new.</p><Link href="/admin/content/notes/new" className="cms-button cms-button-primary">New note</Link></div>}</div>
    {filtered.length > 12 && <div className="cms-pagination"><span>Showing {(page - 1) * 12 + 1}–{Math.min(page * 12,filtered.length)} of {filtered.length}</span><div>{page > 1 && <Link className="cms-button" href={query({page:String(page-1)})}>← Prev</Link>}{page * 12 < filtered.length && <Link className="cms-button" href={query({page:String(page+1)})}>Next →</Link>}</div></div>}
  </div>;
}
