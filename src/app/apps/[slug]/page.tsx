import { AppDetailView } from "@/components/app-detail-view";
import { getAppBySlug } from "@/data/db";
import { absoluteUrl, siteConfig } from "@/data/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app) {
    return {
      title: "App Not Found | Gialoop",
    };
  }

  return {
    title: `${app.title} | Gialoop`,
    description: app.tagline,
    openGraph: {
      title: `${app.title} | Gialoop`,
      description: app.tagline,
      url: absoluteUrl(`/apps/${slug}`),
      images: [{ url: app.thumbnailSrc, alt: app.thumbnailAlt }],
    },
  };
}

export default async function AppPage({ params }: Props) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.title,
    description: app.tagline,
    url: absoluteUrl(`/apps/${slug}`),
    applicationCategory: app.appType === "mobile" ? "MobileApplication" : "WebApplication",
    author: {
      "@type": "Person",
      name: siteConfig.personName
    }
  };

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <AppDetailView app={app} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(appSchema),
        }}
      />
    </main>
  );
}
