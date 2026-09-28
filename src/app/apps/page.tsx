import type { Metadata } from "next";
import { EditorialAppCatalog } from "@/components/editorial-app-catalog";
import { getApps } from "@/data/db";
import { absoluteUrl, siteConfig } from "@/data/seo";

const collectionSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Apps by Gialoop", url: absoluteUrl("/apps"), description: "Flutter app catalog by Gialoop.", isPartOf: { "@type": "WebSite", name: siteConfig.siteName, url: siteConfig.siteUrl } };
export const metadata: Metadata = { title: "App Catalog | Gialoop", description: "Flutter apps, internal tools, and independent products built by Gialoop." };
export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const apps = await getApps();
  return (
    <main id="main-content" className="editorial-list-page editorial-catalog-page">
      <header><span>APP CATALOG</span><h1>All apps, built end to end.</h1><p>Published mobile products, web work, internal tools, and experiments.</p></header>
      <EditorialAppCatalog apps={apps} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </main>
  );
}
