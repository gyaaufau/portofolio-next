"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, CircleGauge, Image as ImageIcon, Layers3, LogOut, Menu, Settings2, X } from "lucide-react";
import { logout } from "@/app/admin/actions";
import "./cms.css";

const navItems = [
  { label: "Overview", href: "/admin", icon: CircleGauge },
  { label: "Content", href: "/admin/content", icon: BookOpen },
  { label: "Sections", href: "/admin/sections", icon: Layers3 },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
];
const mobileItems = [navItems[0], navItems[1], navItems[3], navItems[4]];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useRef<HTMLButtonElement>(null);
  const legacyContent = ["/admin/apps", "/admin/certificates", "/admin/work-experience", "/admin/skills"].some((prefix) => pathname.startsWith(prefix));
  const legacySettings = ["/admin/profile", "/admin/contact", "/admin/appearance"].some((prefix) => pathname.startsWith(prefix));
  const current = legacyContent ? navItems[1] : legacySettings ? navItems[4] : [...navItems].reverse().find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) ?? navItems[0];

  useEffect(() => {
    if (!drawerOpen) return;
    closeDrawer.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
    router.refresh();
  }
  function navigation() {
    return navItems.map((item) => {
      const Icon = item.icon;
      const active = current.href === item.href;
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setDrawerOpen(false)} className={`cms-nav-link${active ? " is-active" : ""}`}><Icon size={17} strokeWidth={1.8} /><span>{item.label}</span></Link>;
    });
  }
  return <div className="cms">
    <aside className="cms-sidebar" aria-label="CMS navigation">
      <Link href="/admin" className="cms-brand"><span className="cms-brand-mark">G</span><span><strong>Studio CMS</strong><small>GIALOOP / PORTFOLIO</small></span></Link>
      <nav className="cms-side-nav">{navigation()}</nav>
      <div className="cms-side-footer"><span className="cms-avatar">G</span><span><strong>Gialoop</strong><small>OWNER / SIGNED IN</small></span><button type="button" onClick={handleLogout} aria-label="Logout"><LogOut size={16} /></button></div>
    </aside>
    <div className="cms-workspace">
      <header className="cms-desktop-bar"><span>CMS <span className="cms-crumb-divider">/</span> <strong>{current.label}</strong></span><div className="cms-bar-actions"><Link href="/" target="_blank">Preview site ↗</Link><Link href="/admin/content?status=draft" className="cms-draft-shortcut">Drafts</Link></div></header>
      <header className="cms-mobile-bar"><button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div><strong>{current.label === "Overview" ? "Studio CMS" : current.label}</strong><small>GIALOOP / CMS</small></div><span className="cms-avatar">G</span></header>
      <main className="cms-main" id="cms-main">{children}</main>
      <nav className="cms-bottom-nav" aria-label="Mobile CMS navigation">{mobileItems.map((item) => { const Icon = item.icon; const active = current.href === item.href; return <Link key={item.href} href={item.href} aria-label={item.label} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span></Link>; })}</nav>
    </div>
    {drawerOpen && <div className="cms-drawer-backdrop" onClick={() => setDrawerOpen(false)}><aside className="cms-drawer" aria-label="All CMS pages" onClick={(event) => event.stopPropagation()}><div className="cms-drawer-head"><span className="cms-brand-mark">G</span><strong>Studio CMS</strong><button ref={closeDrawer} type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}><X size={18} /></button></div><nav>{navigation()}</nav><div className="cms-drawer-foot"><span className="cms-avatar">G</span><span>Gialoop<small>OWNER</small></span><button type="button" onClick={handleLogout} aria-label="Logout"><LogOut size={16} /></button></div></aside></div>}
  </div>;
}
