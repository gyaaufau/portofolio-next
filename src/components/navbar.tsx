"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { House, FolderKanban, Briefcase, User, Award, Mail } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  sectionId: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/", sectionId: "top", icon: House },
  { label: "Projects", href: "/projects", sectionId: "projects", icon: FolderKanban },
  { label: "Experience", href: "/#work-experience", sectionId: "work-experience", icon: Briefcase },
  { label: "About", href: "/#about", sectionId: "about", icon: User },
  { label: "Certificates", href: "/certificates", sectionId: "certificates", icon: Award },
  { label: "Contact", href: "/#contact", sectionId: "contact", icon: Mail },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHomePage) return;

    const sectionIds = navItems.map((i) => i.sectionId).filter((id) => id !== "top");
    const ratios = new Map<string, number>();
    const obs: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([entry]) => {
          ratios.set(id, entry.intersectionRatio);
          let max = 0, maxId = "";
          ratios.forEach((r, sid) => {
            if (r > max) { max = r; maxId = sid; }
          });
          setActiveSection(maxId || "top");
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      o.observe(el);
      obs.push(o);
    });

    return () => obs.forEach((o) => o.disconnect());
  }, [isHomePage]);

  const isActive = useCallback(
    (item: NavItem): boolean => {
      if (isHomePage) return activeSection === item.sectionId;
      if (item.href === "/") return false;
      if (item.href === "/projects") return pathname.startsWith("/projects");
      if (item.href === "/certificates") return pathname.startsWith("/certificates");
      return false;
    },
    [isHomePage, activeSection, pathname]
  );

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop: top sticky, text only */}
      <nav
        className={cn(
          "hidden md:flex sticky top-4 z-10 mb-8 justify-center",
        )}
        aria-label="Primary"
      >
        <div
          className={cn(
            "flex items-center gap-1 rounded-full py-[0.55rem] px-3 bg-background border shadow-sm transition-all duration-300 w-fit",
            scrolled ? "backdrop-blur-xl shadow-md border-border" : "border-border"
          )}
        >
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-[0.7rem] py-[0.4rem] text-[0.8rem] rounded-full transition-all duration-200 whitespace-nowrap",
                  active
                    ? "text-primary font-semibold"
                    : "text-muted font-medium hover:text-foreground"
                )}
                onClick={(e) => handleNavClick(item, e)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile: bottom fixed, icon only */}
      <nav
        className={cn(
          "flex md:hidden fixed bottom-4 left-4 right-4 z-10 justify-center",
        )}
        aria-label="Primary"
      >
        <div
          className={cn(
            "flex items-center justify-around gap-2 rounded-full py-2 px-3 bg-background border border-border shadow-sm w-full max-w-sm transition-all duration-300",
            scrolled ? "backdrop-blur-xl shadow-md" : ""
          )}
        >
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "flex items-center justify-center p-2 rounded-full transition-all duration-200",
                  active
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                )}
                onClick={(e) => handleNavClick(item, e)}
              >
                <Icon className="size-5" />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
