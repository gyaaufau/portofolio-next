"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ScrollReveal } from "@/components/scroll-reveal";

export function PublicChrome({ children, footer, logoSrc }: { children: React.ReactNode; footer: React.ReactNode; logoSrc?: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return children;

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar logoSrc={logoSrc} />
      {children}
      <ScrollReveal />
      {footer}
    </>
  );
}
