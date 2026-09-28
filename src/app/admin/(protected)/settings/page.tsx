import Link from "next/link";
import { redirect } from "next/navigation";
import { updateContact, updateProfile } from "@/app/admin/actions";
import { createAdminClient } from "@/utils/supabase/admin";
import { ImageUpload } from "@/components/image-upload";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const notice = await searchParams;
  const db = createAdminClient();
  const [profileResult, contactResult] = await Promise.all([
    db.from("profile").select("*").limit(1).maybeSingle(),
    db.from("contact").select("*").limit(1).maybeSingle(),
  ]);
  const profile = profileResult.data;
  const contact = contactResult.data;
  async function saveProfile(form: FormData) { "use server"; await updateProfile(form); redirect("/admin/settings?saved=profile"); }
  async function saveContact(form: FormData) { "use server"; await updateContact(form); redirect("/admin/settings?saved=contact"); }
  return <div><div className="cms-page-head"><div><div className="cms-eyebrow">Settings</div><h1>Workspace settings</h1><p>Who you are and how the portfolio presents itself.</p></div></div>{notice.saved && <div className="cms-flash" role="status">{decodeURIComponent(notice.saved)} settings saved.</div>}
    <div className="cms-settings-grid"><div className="cms-editor-main"><form action={saveProfile} className="cms-card"><span className="cms-mono">Profile</span><div className="cms-profile-photo"><ImageUpload bucket="portfolio" path="data/myself" name="photoSrc" currentSrc={profile?.photo_src || ""} /><span>Upload a new photo</span></div><input type="hidden" name="photoAlt" value={profile?.photo_alt || ""} /><input type="hidden" name="photoWidth" value={profile?.photo_width || 400} /><input type="hidden" name="photoHeight" value={profile?.photo_height || 500} /><div className="cms-form-grid"><div className="cms-field"><label htmlFor="settings-name">Full name</label><input id="settings-name" name="name" required defaultValue={profile?.name || ""} /></div><div className="cms-field"><label htmlFor="settings-role">Role</label><input id="settings-role" name="role" required defaultValue={profile?.role || ""} /></div><div className="cms-field cms-span-two"><label htmlFor="settings-intro">Intro</label><textarea id="settings-intro" name="intro" defaultValue={profile?.intro || ""} /></div><div className="cms-field"><label htmlFor="settings-location">Location</label><input id="settings-location" name="location" defaultValue={profile?.location || ""} /></div><label className="cms-check"><input type="checkbox" name="openToOpportunities" defaultChecked={profile?.open_to_opportunities} /> Open to opportunities</label></div><button className="cms-button cms-button-primary" type="submit">Save profile</button></form>
      <form action={saveContact} className="cms-card"><span className="cms-mono">Contact</span><div className="cms-form-grid">{[["email","Email","email"],["whatsapp","WhatsApp","whatsapp"],["github","GitHub","github"],["linkedin","LinkedIn","linkedin"],["playStore","Play Store","play_store"],["playConsole","Play Console","play_console"],["cv","CV URL","cv"]].map(([name,label,column]) => <div className="cms-field" key={name}><label htmlFor={`settings-${name}`}>{label}</label><input id={`settings-${name}`} name={name} defaultValue={contact?.[column] || ""} required={name === "email"} /></div>)}</div><button className="cms-button cms-button-primary" type="submit">Save contact</button></form></div>
    <aside className="cms-editor-main"><div className="cms-card"><span className="cms-mono">Content lists</span><p className="cms-help">Edit experience, skills and certificates in the existing detailed editors.</p><div className="cms-settings-links"><Link href="/admin/work-experience">Experience →</Link><Link href="/admin/skills">Skills →</Link><Link href="/admin/certificates">Certificates →</Link></div></div></aside></div>
  </div>;
}
