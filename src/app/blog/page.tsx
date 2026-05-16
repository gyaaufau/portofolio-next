import { Navbar } from "@/components/navbar";
import { absoluteUrl, siteConfig, websiteSchema } from "@/data/seo";
import Link from "next/link";
import type { Metadata } from "next";

const article = {
  title: "How to Build Scalable Flutter App Architecture",
  href: "/blog/how-to-build-scalable-flutter-app-architecture",
  description:
    "A practical guide to structuring Flutter apps with features, clean architecture boundaries, state management, and performance-minded delivery."
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Gialoop Blog",
  url: absoluteUrl("/blog"),
  description: "Technical writing, Flutter portfolio insights, and mobile engineering notes from Gialoop.",
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: siteConfig.siteUrl
  }
};

export const metadata: Metadata = {
  title: "Blog | Gialoop",
  description: "Technical writing and Flutter engineering notes from Gialoop.",
};

export default function BlogPage() {
  return (
    <main className="page-shell">
      <Navbar />

      <section className="project-page-top panel">
        <Link className="back-link" href="/">back / home</Link>
      </section>

      <section className="blog-index-page panel">
        <div className="blog-index-head">
          <p className="section-eyebrow">blog</p>
          <h1>Technical writing from Gialoop.</h1>
          <p>
            Articles here are written to answer practical Flutter questions with clear structure, direct takeaways,
            and examples that are easy for humans and search engines to understand.
          </p>
        </div>

        <article className="blog-card panel">
          <p className="section-label">Featured Article</p>
          <h2>
            <Link href={article.href}>{article.title}</Link>
          </h2>
          <p>{article.description}</p>
          <div className="blog-card-actions">
            <Link className="button-link secondary" href={article.href}>Read article</Link>
            <Link className="button-link secondary" href="/projects">See project archive</Link>
          </div>
        </article>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema),
        }}
      />
    </main>
  );
}
