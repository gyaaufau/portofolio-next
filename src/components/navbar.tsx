"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Briefcase, Grid2X2, House, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", sectionId: "top", icon: House },
  { label: "Apps", href: "/apps", sectionId: "apps", icon: Grid2X2 },
  { label: "Experience", href: "/#work-experience", sectionId: "work-experience", icon: Briefcase },
  { label: "About", href: "/#about", sectionId: "about", icon: User },
  { label: "Certificates", href: "/certificates", sectionId: "certificates", icon: Award },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState("top");
  const pathname = usePathname();
  const home = pathname === "/";

  useEffect(() => {
    if (!home) return;
    const ratios = new Map<string, number>();
    const observers = navItems.flatMap((item) => {
      const element = document.getElementById(item.sectionId);
      if (!element) return [];
      const observer = new IntersectionObserver(([entry]) => {
        ratios.set(item.sectionId, entry.intersectionRatio);
        let next = "top";
        let maximum = 0;
        ratios.forEach((ratio, id) => { if (ratio > maximum) { maximum = ratio; next = id; } });
        setActiveSection(next);
      }, { threshold: [0, 0.2, 0.45, 0.7] });
      observer.observe(element);
      return [observer];
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, [home]);

  const isActive = useCallback((item: (typeof navItems)[number]) => {
    if (home) return activeSection === item.sectionId;
    if (item.href === "/apps") return pathname.startsWith("/apps");
    if (item.href === "/certificates") return pathname.startsWith("/certificates");
    return false;
  }, [activeSection, home, pathname]);

  const handleClick = (item: (typeof navItems)[number], event: React.MouseEvent) => {
    if (!home || item.href === "/apps" || item.href === "/certificates") return;
    event.preventDefault();
    document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav className={cn("site-navbar top-0 z-50 hidden border-b backdrop-blur-lg md:block", home ? "fixed inset-x-0" : "sticky border-border bg-background/90", home && activeSection === "top" ? "is-over-hero border-white/10 bg-[#07110e]/28 text-white" : "border-border bg-background/90")} aria-label="Primary">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center px-6">
          <Link href="/" className="text-pixel text-[10px] text-primary">GIALOOP</Link>
          <div className="ml-auto flex items-center gap-1">
            {navItems.map((item) => <Link key={item.label} href={item.href} onClick={(event) => handleClick(item, event)} className={cn("rounded-[4px] px-3 py-2 text-sm font-medium transition-colors", isActive(item) ? "bg-primary text-primary-foreground" : home && activeSection === "top" ? "text-white/66 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>{item.label}</Link>)}
          </div>
          <Link href="/#contact" className={cn("pixel-button ml-3 min-h-0 px-3 py-2 text-xs", home && activeSection === "top" ? "border-white/24 bg-white/10 text-white" : "bg-card text-foreground")}>Contact</Link>
        </div>
      </nav>
      <nav className={cn("site-navbar fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm border p-2 shadow-[4px_4px_0_var(--pixel-shadow)] backdrop-blur-lg md:hidden", home && activeSection === "top" ? "border-white/16 bg-[#07110e]/78" : "border-border bg-background/94")} aria-label="Primary">
        <div className="flex justify-around">
          {navItems.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} onClick={(event) => handleClick(item, event)} aria-label={item.label} className={cn("rounded-[4px] p-2.5", isActive(item) ? "bg-primary text-primary-foreground" : home && activeSection === "top" ? "text-white/62" : "text-muted-foreground")}><Icon className="size-5" /></Link>; })}
        </div>
      </nav>
    </>
  );
}
