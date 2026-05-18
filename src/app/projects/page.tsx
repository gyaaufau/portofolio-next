import { Projects } from "@/components/projects";
import { portfolioProjects } from "@/data/portfolio";
import { absoluteUrl, siteConfig, websiteSchema } from "@/data/seo";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Flutter Projects by Gialoop",
  url: absoluteUrl("/projects"),
  description: "Project archive for Argya Aulia Fauzandika, featuring Flutter apps and mobile product work.",
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: siteConfig.siteUrl
  }
};

export const metadata: Metadata = {
  title: "Flutter Projects | Gialoop",
  description: "Project archive featuring Flutter apps, internal tools, and mobile product work by Gialoop.",
};

export default function ProjectsPage() {
  return (
    <main className="relative w-full max-w-[1280px] mx-auto px-6 pt-6 pb-20">
      <section className="mt-4 p-6 rounded-3xl bg-card border border-border shadow-sm">
        <Link className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors w-fit mb-6" href="/">
          <ChevronLeft className="w-3.5 h-3.5" /> back / home
        </Link>

        <div className="mb-6">
          <p className="m-0 mb-[0.75rem] text-primary text-[0.8rem] font-semibold tracking-[0.06em] uppercase">all projects</p>
          <h1 className="m-0 text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.03em] font-bold">Project archive.</h1>
          <p className="mt-2 text-muted-foreground">Featured and regular projects are collected here. Featured items are marked directly on the card.</p>
        </div>

        <Projects projects={portfolioProjects} showFeaturedChip={true} />
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
