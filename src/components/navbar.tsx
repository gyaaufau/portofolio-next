"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionHref = (section: string) => (isHomePage ? section : `/${section}`);
  
  const navItems = [
    { label: "Home", href: isHomePage ? "#top" : "/" },
    { label: "Projects", href: sectionHref("#projects") },
    { label: "Experience", href: sectionHref("#work-experience") },
    { label: "About", href: sectionHref("#about") },
    { label: "Certificates", href: sectionHref("#certificates") },
    { label: "Contact", href: sectionHref("#contact") }
  ];

  const handleNavClick = (href: string) => {
    if (window.innerWidth <= 720) {
      setDrawerOpen(false);
    }
    if (href.startsWith("#") && isHomePage) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) {
    return (
      <nav className="navbar panel" aria-label="Primary">
        <div className="navbar-top">
          <Link className="navbar-brand" href="/">
            <span className="text-lg font-bold">Gialoop</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={`navbar panel ${scrolled ? 'navbar-scrolled' : ''}`} 
      aria-label="Primary"
      data-drawer-open={drawerOpen}
    >
      <div className="navbar-top">
        <Link className="navbar-brand" href={isHomePage ? "#top" : "/"}>
          <img 
            className="navbar-brand-logo navbar-brand-logo-dark" 
            src="/data/brand/logo.svg" 
            alt="gialoop logo" 
          />
          <img 
            className="navbar-brand-logo navbar-brand-logo-light" 
            src="/data/brand/logo-light.svg" 
            alt="gialoop logo" 
          />
        </Link>

        <button
          className="navbar-toggle"
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="primary-drawer"
          aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="navbar-links" id="primary-drawer" data-open={drawerOpen || undefined}>
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            data-active={pathname === item.href || (item.href === "/" && pathname === "/")}
            onClick={(e) => {
              if (item.href.startsWith("#")) {
                e.preventDefault();
                handleNavClick(item.href);
              }
            }}
          >
            {item.label}
          </Link>
        ))}
        <button
          className="theme-toggle"
          type="button"
          role="switch"
          aria-checked={theme === "light"}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          data-theme-state={theme}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb"></span>
          </span>
          <span className="theme-toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
        </button>
      </div>
    </nav>
  );
}
