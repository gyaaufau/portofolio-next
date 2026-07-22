"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ScrollReveal } from "@/components/scroll-reveal";

export function PublicChrome({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return children;

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      {children}
      <ScrollReveal />
      {footer}
    </>
  );
}
