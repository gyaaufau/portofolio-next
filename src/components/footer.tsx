import { siteConfig } from "@/data/seo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground">
      <p>&copy; {year} {siteConfig.personName}.</p>
    </footer>
  );
}
