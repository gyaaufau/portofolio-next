import Link from "next/link";
import { notFound } from "next/navigation";
import { getCmsDraft } from "@/lib/cms-data";
import { createAdminClient } from "@/utils/supabase/admin";
import { publishCmsDraft, saveAndPublishCmsDraft, saveCmsDraft } from "@/app/admin/cms-actions";
import { ImageUpload } from "@/components/image-upload";

export default async function NoteEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; published?: string; error?: string }> }) {
  const { id } = await params;
  const notice = await searchParams;
  const db = createAdminClient();
  const [{ data: note }, draft] = await Promise.all([
    id === "new" ? Promise.resolve({ data: null }) : db.from("cms_note").select("*").eq("id", id).maybeSingle(),
    id === "new" ? Promise.resolve(null) : getCmsDraft("note", id),
  ]);
  if (id !== "new" && !note && !draft) notFound();
  const value = (key: string) => draft?.[key] ?? (note?.[key === "coverSrc" ? "cover_src" : key] as string | undefined) ?? "";
  const save = saveCmsDraft.bind(null, "note", id);
  const publish = saveAndPublishCmsDraft.bind(null, "note", id);
  return <div className="cms-editor"><div className="cms-page-head"><div><div className="cms-eyebrow">Content / Notes / {id === "new" ? "New" : "Edit"}</div><h1>{value("title") || "Write a new note."}</h1><p>{draft ? "Draft changes saved in the CMS." : note ? "Published note" : "Start with a title and a story."}</p></div><Link href="/admin/content?type=note" className="cms-button">← Content</Link></div>
    {(notice.saved || notice.published || notice.error) && <div className="cms-flash" role="status">{notice.error ? decodeURIComponent(notice.error) : notice.published ? "Note published in the CMS." : "Draft saved."}</div>}
    <form className="cms-editor-grid"><div className="cms-editor-main"><section className="cms-card"><span className="cms-mono">01 · Front matter</span><div className="cms-form-grid"><div className="cms-field"><label htmlFor="note-title">Title</label><input id="note-title" name="title" required defaultValue={value("title")} /></div><div className="cms-field"><label htmlFor="note-slug">Slug</label><input id="note-slug" name="slug" defaultValue={value("slug") || (id === "new" ? "" : id)} /></div><div className="cms-field cms-span-two"><label htmlFor="note-summary">Summary</label><textarea id="note-summary" name="summary" defaultValue={value("summary")} rows={3} /></div><div className="cms-field"><label htmlFor="note-tags">Tags · comma separated</label><input id="note-tags" name="tags" defaultValue={draft?.tags ?? (note?.tags || []).join(", ")} /></div></div></section>
    <section className="cms-card"><span className="cms-mono">02 · Body</span><div className="cms-field"><label htmlFor="note-body">Story · Markdown</label><textarea id="note-body" name="body" required defaultValue={value("body")} rows={18} className="cms-writing-area" /></div></section>
    <section className="cms-card"><span className="cms-mono">03 · Cover</span><div className="cms-cover-upload"><ImageUpload bucket="portfolio" path="notes" name="coverSrc" currentSrc={value("coverSrc")} maxSizeMB={10} /><p>PNG, JPG or WEBP · 10 MB maximum</p></div></section></div>
    <aside className="cms-editor-aside"><div className="cms-card"><span className="cms-mono">Publish status</span><p>Title, slug and body are required to publish. Saving a draft leaves the published note unchanged.</p></div><button type="submit" formAction={publish} className="cms-button cms-button-primary">Save and publish</button><button type="submit" formAction={save} className="cms-button">Save draft</button></aside></form>
    {draft && id !== "new" && <form action={publishCmsDraft.bind(null,"note",id)} className="cms-publish-existing"><button className="cms-button cms-button-primary">Publish saved draft</button></form>}
  </div>;
}
