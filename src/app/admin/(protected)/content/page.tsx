import Link from "next/link";
import Image from "next/image";
import { getCmsLibrary } from "@/lib/cms-data";
import { contentTab, contentTabs } from "@/lib/cms-content";
import { publishAllCmsDrafts } from "@/app/admin/cms-actions";

type Params = { q?: string; status?: string; type?: string; page?: string; published?: string; failed?: string; details?: string };
export default async function ContentPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const kind = contentTab(params.type);
  const tab = contentTabs.find((tab) => tab.kind === kind)!;
  const rows = await getCmsLibrary();
  const entries = rows.filter((row) => row.kind === kind);
  const draftCount = entries.filter((row) => row.status === "draft").length;
  const status = kind === "note" && ["draft", "published"].includes(params.status || "") ? params.status : "";
  const filtered = entries.filter((row) => (!status || row.status === status) && (!params.q || `${row.title} ${row.summary || ""}`.toLowerCase().includes(params.q.toLowerCase())));
  const requestedPage = Number(params.page);
  const page = Math.min(Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1), Math.max(1, Math.ceil(filtered.length / 12)));
  const visible = filtered.slice((page - 1) * 12, page * 12);
  const query = (overrides: Params) => {
    const next = new URLSearchParams({ type:kind });
    for (const [key,value] of Object.entries({ q:params.q, status, page:String(page), ...overrides })) if (value) next.set(key,value); else next.delete(key);
    return `/admin/content?${next}`;
  };
  return <div>
    <nav className="cms-content-tabs" aria-label="Content types">
      {contentTabs.map((item) => <Link key={item.kind} href={`/admin/content?type=${item.kind}`} aria-current={kind === item.kind ? "page" : undefined} className={`cms-content-tab${kind === item.kind ? " is-active" : ""}`}>{item.label}<span>{rows.filter((row) => row.kind === item.kind).length}</span></Link>)}
    </nav>
    <div className="cms-page-head"><div><div className="cms-eyebrow">Content / {tab.label}</div><h1>{tab.label}</h1><p>{entries.length} {kind === "skills" ? "skill groups" : "entries"} · {kind === "note" ? "Write, save drafts, and publish your stories." : "Save changes to update your portfolio immediately."}</p></div><Link href={tab.createHref} className="cms-button cms-button-primary">+ {tab.createLabel}</Link></div>
    {kind === "note" && params.published !== undefined && <div className="cms-flash" role="status">{params.published} notes published. {params.failed || "0"} failed; their drafts were kept.{params.details && <p>{params.details}</p>}</div>}
    <div className="cms-content-toolbar"><form action="/admin/content" className="cms-search-form"><input type="hidden" name="type" value={kind} />{status && <input type="hidden" name="status" value={status} />}<input key={kind} className="cms-search" name="q" type="search" placeholder={`Search ${tab.label.toLowerCase()}…`} defaultValue={params.q || ""} aria-label={`Search ${tab.label}`} /><button className="cms-button" type="submit">Search</button></form>
      {kind === "note" && <div className="cms-pills">{[["","All"],["draft","Drafts"],["published","Published"]].map(([value,label]) => <Link key={value} href={query({ status:value, page:"1" })} aria-current={status === value ? "page" : undefined} className={`cms-pill${status === value ? " is-active" : ""}`}>{label}{value === "draft" && <span> {draftCount}</span>}</Link>)}</div>}
    </div>
    {kind === "note" && draftCount > 0 && <div className="cms-publish-bar"><span><strong>{draftCount} note draft{draftCount === 1 ? "" : "s"}</strong> waiting to publish</span><form action={publishAllCmsDrafts}><button type="submit" className="cms-button cms-button-primary">Publish note drafts</button></form></div>}
    <div className={`cms-content-list cms-focused-list${kind === "app" ? " cms-app-list" : ""}`}>
      <div className="cms-list-head"><span>{kind === "app" ? "App" : "Title"}</span><span>{kind === "app" ? "Legal pages" : "Status"}</span><span>Action</span></div>
      {visible.map((row) => <Link className="cms-content-row" href={row.href} key={`${row.kind}-${row.id}`}>
        <span className="cms-content-identity">{kind === "app" && <Image src={row.icon || "/data/myself/me.webp"} alt="" width={44} height={44} className="cms-app-icon" />}<span className="cms-row-title"><strong>{row.title}</strong><small>{kind === "app" ? `${row.platform || "mobile"} · ${row.workType || "personal"}${row.featured ? " · Featured" : ""}` : row.summary || (row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "")}</small>{row.status === "unsaved" && <span className="cms-status cms-status-draft">Unsaved changes</span>}</span></span>
        <span>{kind === "app" ? <span className="cms-legal-badges"><span className={row.privacy ? "is-enabled" : ""}>Privacy {row.privacy ? "on" : "off"}</span><span className={row.accountDeletion ? "is-enabled" : ""}>Deletion {row.accountDeletion ? "on" : "off"}</span></span> : row.status !== "unsaved" && <span className={`cms-status${row.status === "draft" ? " cms-status-draft" : ""}`}>{kind === "note" ? row.status : "Saved"}</span>}</span>
        <span className="cms-edit-label">Edit →</span>
      </Link>)}
      {!visible.length && <div className="cms-empty-state"><strong>{params.q || status ? "No matches found." : `No ${tab.label.toLowerCase()} yet.`}</strong><p>{params.q || status ? "Try another search or filter." : "Add your first entry to get started."}</p><Link href={tab.createHref} className="cms-button cms-button-primary">{tab.createLabel}</Link></div>}
    </div>
    {filtered.length > 12 && <div className="cms-pagination"><span>Showing {(page - 1) * 12 + 1}–{Math.min(page * 12,filtered.length)} of {filtered.length}</span><div>{page > 1 && <Link className="cms-button" href={query({page:String(page-1)})}>← Prev</Link>}{page * 12 < filtered.length && <Link className="cms-button" href={query({page:String(page+1)})}>Next →</Link>}</div></div>}
  </div>;
}
