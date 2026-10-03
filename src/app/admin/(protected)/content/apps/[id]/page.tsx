import Link from "next/link";
import { notFound } from "next/navigation";
import { getCmsDraft } from "@/lib/cms-data";
import { createAdminClient } from "@/utils/supabase/admin";
import { saveCmsContent } from "@/app/admin/cms-actions";
import { ImageUpload } from "@/components/image-upload";
import { ScreenshotUpload } from "@/components/screenshot-upload";
import { AppEditorForm } from "./app-editor-form";
import ReactMarkdown from "react-markdown";
import { toLegalMarkdown } from "@/lib/legal-content";

const fields: Array<[string,string,string]> = [
  ["title","Title","title"], ["slug","Slug","slug"], ["tagline","Summary","tagline"],
  ["period","Period","period"], ["periodShort","Short period","period_short"],
  ["category","Catalog category","category"], ["releaseYear","Release year","release_year"],
  ["appStoreUrl","App Store","app_store_url"], ["playStoreUrl","Google Play","play_store_url"],
  ["websiteUrl","Website","website_url"], ["githubUrl","Source code","github_url"],
  ["otherUrl","Other URL","other_url"], ["otherUrlLabel","Other URL label","other_url_label"],
];

export default async function CmsAppEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; published?: string; error?: string }> }) {
  const { id } = await params;
  const notice = await searchParams;
  const db = createAdminClient();
  const [{ data: app }, draft] = await Promise.all([
    id === "new" ? Promise.resolve({ data: null }) : db.from("app").select("*,app_screenshot(*)").eq("id", id).maybeSingle(),
    id === "new" ? Promise.resolve(null) : getCmsDraft("app", id),
  ]);
  if (id !== "new" && !app && !draft) notFound();
  const value = (key: string, column = key) => draft?.[key] ?? (app?.[column] as string | undefined) ?? "";
  const save = saveCmsContent.bind(null, "app", id);
  const legalFlag = (name: string, column: string) => draft?.[name] !== undefined ? draft[name] === "on" : Boolean(app?.[column]);
  const legalHtml = (name: string, column: string) => <ReactMarkdown>{toLegalMarkdown(String(value(name, column)))}</ReactMarkdown>;
  const screenshots = draft?.screenshotCount !== undefined
    ? Array.from({ length: Math.max(0,Math.min(50,Number(draft.screenshotCount) || 0)) },(_,index) => ({ src:draft[`screenshotSrc_${index}`] || "", alt:draft[`screenshotAlt_${index}`] || "", order:index })).filter((shot) => shot.src)
    : (app?.app_screenshot ?? []).map((shot: { id: string; src: string; alt: string; order: number }) => ({ ...shot }));
  return <div className="cms-editor"><div className="cms-page-head"><div><div className="cms-eyebrow">Content / Apps / {id === "new" ? "New" : "Edit"}</div><h1>{value("title") || "Add an app."}</h1><p>{draft ? "Unsaved changes restored. Save to apply them to your site." : app ? "Changes go live when saved." : "Add your app and save it to your portfolio."}</p></div><Link href="/admin/content?type=app" className="cms-button">← Content</Link></div>
    {(notice.saved || notice.published || notice.error) && <div className="cms-flash" role="status">{notice.error ? decodeURIComponent(notice.error) : "App saved."}</div>}
    <AppEditorForm action={save} isNew={id === "new"} initial={{ platform:String(value("appType","app_type") || "mobile"), privacy:legalFlag("hasPrivacyPolicy","has_privacy_policy"), deletion:legalFlag("hasAccountDeletion","has_account_deletion"), requiresAuth:legalFlag("accountDeletionRequiresAuth","account_deletion_requires_auth"), privacyHtml:legalHtml("privacyPolicyContent","privacy_policy_content"), deletionHtml:legalHtml("accountDeletionContent","account_deletion_content") }}><section id="app-basics" className="cms-card"><span className="cms-mono">01 · Basics</span><div className="cms-form-grid">{fields.slice(0,7).map(([name,label,column]) => <div className={`cms-field ${name === "tagline" ? "cms-span-two" : ""}`} key={name}><label htmlFor={`app-${name}`}>{label}</label><input id={`app-${name}`} name={name} required={name === "title"} type={name === "releaseYear" ? "number" : "text"} defaultValue={value(name,column)} /></div>)}<div className="cms-field cms-span-two"><label htmlFor="app-description">Description</label><textarea id="app-description" name="description" defaultValue={value("description")} rows={6} /></div><div className="cms-field"><label htmlFor="app-type">Platform</label><select id="app-type" name="appType" defaultValue={value("appType","app_type") || "mobile"}><option value="mobile">Mobile</option><option value="web">Web</option><option value="desktop">Desktop</option><option value="backend">Backend</option></select></div><div className="cms-field"><label htmlFor="app-worktype">Work type</label><select id="app-worktype" name="workType" defaultValue={value("workType","work_type") || "personal"}><option value="personal">Personal</option><option value="work">Work</option></select></div><div className="cms-field"><label htmlFor="app-sort">Sort order</label><input id="app-sort" name="sortOrder" type="number" defaultValue={value("sortOrder","sort_order") || "0"} /></div><label className="cms-check"><input type="checkbox" name="featured" defaultChecked={draft ? draft.featured === "on" : Boolean(app?.featured)} /> Feature this app on the homepage</label></div></section>
    <section id="app-media" className="cms-card"><span className="cms-mono">02 · Media</span><div className="cms-image-fields"><div className="cms-field"><label>App icon</label><ImageUpload bucket="apps" path={id === "new" ? "drafts" : id} name="appIconSrc" currentSrc={value("appIconSrc","app_icon_src")} /><label htmlFor="app-icon-alt">Icon description</label><input id="app-icon-alt" name="appIconAlt" defaultValue={value("appIconAlt","app_icon_alt")} /></div><div className="cms-field"><label>Thumbnail</label><ImageUpload bucket="apps" path={id === "new" ? "drafts" : id} name="thumbnailSrc" currentSrc={value("thumbnailSrc","thumbnail_src")} /><label htmlFor="app-thumbnail-alt">Thumbnail description</label><input id="app-thumbnail-alt" name="thumbnailAlt" defaultValue={value("thumbnailAlt","thumbnail_alt")} /></div></div><h3 className="cms-subhead">Screenshots</h3><ScreenshotUpload bucket="apps" path={id === "new" ? "drafts" : id} initialScreenshots={screenshots} /><p className="cms-help">Images upload immediately; their order is saved with this app.</p></section>
  <section id="app-links" className="cms-card"><span className="cms-mono">03 · Store links</span><div className="cms-form-grid">{fields.slice(7).map(([name,label,column]) => <div className="cms-field cms-span-two" key={name}><label htmlFor={`app-${name}`}>{label}</label><input id={`app-${name}`} name={name} type={name === "otherUrlLabel" ? "text" : "url"} defaultValue={value(name,column)} /></div>)}</div></section>
    <section id="app-details" className="cms-card"><span className="cms-mono">04 · Details</span><div className="cms-form-grid"><div className="cms-field cms-span-two"><label htmlFor="app-stack">Stack · comma separated</label><input id="app-stack" name="stack" defaultValue={draft?.stack ?? (app?.stack ?? []).join(", ")} /></div><div className="cms-field cms-span-two"><label htmlFor="app-highlights">Highlights · one per line</label><textarea id="app-highlights" name="highlights" defaultValue={draft?.highlights ?? (app?.highlights ?? []).join("\n")} rows={5} /></div><div className="cms-field cms-span-two"><label htmlFor="app-sections">Additional sections · JSON</label><textarea id="app-sections" name="sections" defaultValue={draft?.sections ?? JSON.stringify(app?.sections ?? [], null, 2)} rows={6} /></div></div></section>
    </AppEditorForm>
  </div>;
}
