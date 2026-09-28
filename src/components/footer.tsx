import Link from "next/link";
import { getContact, getProfile } from "@/data/db";
import { formatCopyrightYear } from "@/lib/copyright";

export async function Footer() {
  const copyrightYear = formatCopyrightYear(new Date().getFullYear());
  const [profile, contact] = await Promise.all([getProfile(), getContact()]);

  return (
    <footer className="editorial-footer">
      <div><strong>{profile.name}</strong><p>{profile.role}</p><Link href={contact.github}>GitHub</Link><Link href={contact.linkedin}>LinkedIn</Link></div>
      <div><span>Pages</span><Link href="/">Home</Link><Link href="/apps">Apps</Link><Link href="/blog">Notes</Link><Link href="/cv">CV</Link></div>
      <div><span>Contact</span><Link href={`mailto:${contact.email}`}>{contact.email}</Link><Link href={contact.whatsapp}>WhatsApp</Link></div>
      <small>© {copyrightYear} {profile.name}</small>
    </footer>
  );
}
