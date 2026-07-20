import Link from "next/link";
import { siteConfig } from "@/data/seo";

export function Footer() {
  return (
    <footer className="mx-auto mb-24 mt-8 max-w-[1280px] border-t border-border px-6 py-8 text-sm text-muted-foreground md:mb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} {siteConfig.personName}</p>
        <div className="flex gap-5"><Link href="/apps" className="hover:text-primary">Apps</Link><Link href="/blog" className="hover:text-primary">Writing</Link><Link href="/cv" className="hover:text-primary">CV</Link></div>
      </div>
    </footer>
  );
}
