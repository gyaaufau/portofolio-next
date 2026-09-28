import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function ListsPage() {
  const db = createAdminClient();
  const [experience, skills, certificates] = await Promise.all([
    db.from("work_experience").select("id,role,company,location,period").order("sort_order"),
    db.from("skill_category").select("id,name,items").order("name"),
    db.from("certificate").select("id,title,issuer,issued").order("issued",{ ascending:false }),
  ]);
  for (const result of [experience, skills, certificates]) if (result.error) throw new Error(result.error.message);
  return <div><div className="cms-page-head"><div><div className="cms-eyebrow">Content / List editors</div><h1>Experience, skills and certificates</h1><p>Manage the lists that shape your portfolio story.</p></div><Link href="/admin/content" className="cms-button">← Content library</Link></div><div className="cms-lists-grid">
    <section className="cms-card"><div className="cms-card-heading"><div><span className="cms-mono">Experience</span><p>{experience.data?.length || 0} roles on the timeline</p></div><Link href="/admin/work-experience/new">+ Add role</Link></div>{(experience.data ?? []).map((row) => <Link className="cms-list-item" href={`/admin/work-experience/${row.id}/edit`} key={row.id}><span><strong>{row.role}</strong><small>{row.company} · {row.location}</small></span><span className="cms-mono">{row.period}</span><span aria-hidden="true">↗</span></Link>)}{!experience.data?.length && <p className="cms-empty">No roles yet.</p>}</section>
    <section className="cms-card"><div className="cms-card-heading"><div><span className="cms-mono">Skills</span><p>{skills.data?.reduce((n,row) => n + (row.items?.length || 0),0) || 0} skills in {skills.data?.length || 0} groups</p></div><Link href="/admin/skills">Edit skills ↗</Link></div>{(skills.data ?? []).map((row) => <Link className="cms-list-item" href="/admin/skills" key={row.id}><span><strong>{row.name}</strong><small>{(row.items ?? []).slice(0,3).join(" · ")}</small></span><span className="cms-mono">{row.items?.length || 0}</span><span aria-hidden="true">↗</span></Link>)}{!skills.data?.length && <p className="cms-empty">No skills yet.</p>}</section>
    <section className="cms-card"><div className="cms-card-heading"><div><span className="cms-mono">Certificates</span><p>{certificates.data?.length || 0} credentials shown</p></div><Link href="/admin/certificates/new">+ Add certificate</Link></div>{(certificates.data ?? []).map((row) => <Link className="cms-list-item" href={`/admin/certificates/${row.id}/edit`} key={row.id}><span><strong>{row.title}</strong><small>{row.issuer}</small></span><span className="cms-mono">{row.issued}</span><span aria-hidden="true">↗</span></Link>)}{!certificates.data?.length && <p className="cms-empty">No certificates yet.</p>}</section>
    <aside className="cms-next-card"><span className="cms-mono">Preview</span><h2>These lists build the About and Experience sections.</h2><Link href="/" target="_blank">Open site preview ↗</Link></aside>
  </div></div>;
}
