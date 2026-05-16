import { Navbar } from "@/components/navbar";
import { Projects } from "@/components/projects";
import { portfolioProjects } from "@/data/portfolio";
import { absoluteUrl, siteConfig, websiteSchema } from "@/data/seo";
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
    <main className="page-shell">
      <Navbar />

      <section className="project-page-top panel">
        <Link className="back-link" href="/#projects">back / home</Link>
      </section>

      <section className="project-archive-page panel">
        <div className="project-archive-head">
          <p className="section-eyebrow">all projects</p>
          <h1>Project archive.</h1>
          <p>Featured and regular projects are collected here. Featured items are marked directly on the card.</p>
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
