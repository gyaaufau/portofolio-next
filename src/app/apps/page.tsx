import type { Metadata } from "next";
import { AppCard } from "@/components/app-card";
import { BackLink } from "@/components/back-link";
import { getApps } from "@/data/db";
import { absoluteUrl, siteConfig } from "@/data/seo";

const collectionSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Apps by Gialoop", url: absoluteUrl("/apps"), description: "Flutter app catalog by Gialoop.", isPartOf: { "@type": "WebSite", name: siteConfig.siteName, url: siteConfig.siteUrl } };
export const metadata: Metadata = { title: "App Catalog | Gialoop", description: "Flutter apps, internal tools, and independent products built by Gialoop." };
export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const apps = await getApps();
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <BackLink href="/" label="Home" />
      <header className="max-w-3xl py-14 md:py-20">
        <p className="text-pixel text-[9px] text-primary">APP LIBRARY</p>
        <h1 className="mt-5 text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">Things I&apos;ve shipped.</h1>
        <p className="mt-6 max-w-[58ch] text-lg leading-8 text-muted-foreground">A browsable catalog of mobile products, internal tools, and experiments with the engineering story intact.</p>
      </header>
      {apps.length ? <div className="border-t border-border">{apps.map((app) => <AppCard key={app.id} app={app} />)}</div> : <div className="pixel-frame bg-card p-8 text-muted-foreground">No apps have been published here yet.</div>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </main>
  );
}
