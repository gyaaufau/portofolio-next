import Link from "next/link";
import { getContact, getProfile } from "@/data/db";
import { formatCopyrightYear } from "@/lib/copyright";

export async function Footer() {
  const copyrightYear = formatCopyrightYear(new Date().getFullYear());
  const [profile, contact] = await Promise.all([getProfile(), getContact()]);

  return (
    <footer className="editorial-footer">
      <div className="editorial-footer-main">
        <div className="editorial-footer-brand">
          <Link href="/" className="editorial-footer-name">{profile.name}</Link>
          <p>{profile.role}</p>
        </div>
        <nav aria-label="Footer navigation" className="editorial-footer-links">
          <Link href="/">Home</Link>
          <Link href="/apps">Apps</Link>
          <Link href="/blog">Notes</Link>
          <Link href="/cv">CV</Link>
        </nav>
      </div>
      <div className="editorial-footer-meta">
        <div className="editorial-footer-contact">
          <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
          <Link href={contact.github} target="_blank" rel="noreferrer">GitHub</Link>
          <Link href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</Link>
        </div>
        <small>© {copyrightYear} {profile.name}</small>
      </div>
    </footer>
  );
}
