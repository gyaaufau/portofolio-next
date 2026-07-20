import { AppCard } from "@/components/app-card";
import { getApps } from "@/data/db";
import { absoluteUrl, siteConfig } from "@/data/seo";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Apps by Gialoop",
  url: absoluteUrl("/apps"),
  description: "App catalog featuring Flutter apps, web applications, and backend services by Gialoop.",
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: siteConfig.siteUrl
  }
};

export const metadata: Metadata = {
  title: "App Catalog | Gialoop",
  description: "App catalog featuring Flutter apps, web applications, and backend services by Gialoop.",
};

export default async function AppsPage() {
  const apps = await getApps();

  return (
    <main className="relative w-full max-w-[1280px] mx-auto px-6 pt-6 pb-20">
      <section className="mt-4 p-6 rounded-3xl bg-card border border-border shadow-sm">
        <Link className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors w-fit mb-6" href="/">
          <ChevronLeft className="w-3.5 h-3.5" /> back / home
        </Link>

        <div className="mb-6">
          <p className="m-0 mb-[0.75rem] text-primary text-pixel text-[10px] font-semibold tracking-[0.06em] uppercase">all apps</p>
          <h1 className="m-0 text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.03em] font-bold">App catalog.</h1>
          <p className="mt-2 text-muted-foreground">Featured and regular apps are collected here. Featured items are marked directly on the card.</p>
        </div>

        <div className="space-y-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
    </main>
  );
}
