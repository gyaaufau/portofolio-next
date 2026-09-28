"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Award, Briefcase, Grid2X2, House, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", sectionId: "top", icon: House },
  { label: "Apps", href: "/apps", sectionId: "apps", icon: Grid2X2 },
  { label: "Work", href: "/#work", sectionId: "work", icon: Briefcase },
  { label: "About", href: "/#about", sectionId: "about", icon: User },
  { label: "Notes", href: "/blog", sectionId: "notes", icon: Award },
];

export function Navbar({ logoSrc }: { logoSrc?: string }) {
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
      <nav className="editorial-nav" aria-label="Primary">
        <div>
          <Link href="/" className="flex items-center shrink-0">
            {logoSrc ? <Image src={logoSrc} alt="Gialoop" width={120} height={28} className="h-7 w-auto" priority /> : <span className="text-pixel text-[10px] text-primary">GIALOOP</span>}
          </Link>
          <div>
            {navItems.map((item) => <Link key={item.label} href={item.href} onClick={(event) => handleClick(item, event)} className={cn(isActive(item) ? "is-active" : "")}>{item.label}</Link>)}
          </div>
          <Link href="/#contact" className="editorial-availability">Available for projects</Link>
        </div>
      </nav>
      <nav className="editorial-mobile-nav" aria-label="Primary">
        <div className="flex justify-around">
          {navItems.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} onClick={(event) => handleClick(item, event)} aria-label={item.label} className={cn(isActive(item) ? "is-active" : "")}><Icon className="size-5" /></Link>; })}
        </div>
      </nav>
    </>
  );
}
