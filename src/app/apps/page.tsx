import type { Metadata } from "next";
import { AppCard } from "@/components/app-card";
import { BackLink } from "@/components/back-link";
import { PixelOrnament } from "@/components/pixel-ornament";
import { PublicPageHeader } from "@/components/public-page-header";
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
      <PublicPageHeader eyebrow="APP LIBRARY" title="Things I've shipped." description="A browsable catalog of mobile products, internal tools, and experiments with the engineering story intact." ornament="reclaimed-computer-folder" />
      {apps.length ? <div className="border-t border-border">{apps.map((app) => <AppCard key={app.id} app={app} />)}</div> : <div className="flex flex-col items-center"><div className="pixel-frame pixel-grid bg-card p-8 text-center md:p-12"><p className="text-pixel text-[9px] text-primary">EMPTY ROOM</p><p className="mt-4 text-muted-foreground">No apps have been published here yet.</p></div><PixelOrnament name="mossy-masonry-vine" className="-mt-10 w-32 self-start md:-mt-16 md:w-64" /></div>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </main>
  );
}
