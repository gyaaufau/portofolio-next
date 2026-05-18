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
    <main className="relative w-full max-w-[1280px] mx-auto px-6 pt-6 pb-20">
      <section className="mt-4 p-5 rounded-xl bg-card border border-border shadow-sm">
        <Link className="text-primary text-[0.82rem] font-semibold lowercase" href="/">back / home</Link>
      </section>

      <section className="grid gap-6 p-5 rounded-xl bg-card border border-border shadow-sm">
        <div className="grid gap-[0.8rem]">
          <p className="m-0 mb-[0.75rem] text-primary text-[0.8rem] font-semibold tracking-[0.06em] uppercase">blog</p>
          <h1>Technical writing from Gialoop.</h1>
          <p>
            Articles here are written to answer practical Flutter questions with clear structure, direct takeaways,
            and examples that are easy for humans and search engines to understand.
          </p>
        </div>

        <article className="p-5 rounded-xl bg-card border border-border shadow-sm">
          <p className="text-muted-foreground text-[0.8rem] font-semibold tracking-[0.06em] uppercase mb-[0.75rem]">Featured Article</p>
          <h2>
            <Link href={article.href}>{article.title}</Link>
          </h2>
          <p>{article.description}</p>
          <div className="flex flex-wrap gap-3 items-center mt-4">
            <Link className="inline-flex items-center justify-center min-h-[2.75rem] rounded-full px-5 py-[0.72rem] border text-[0.85rem] font-semibold transition-all hover:-translate-y-0.5 bg-secondary border-border text-foreground hover:border-muted hover:bg-card" href={article.href}>Read article</Link>
            <Link className="inline-flex items-center justify-center min-h-[2.75rem] rounded-full px-5 py-[0.72rem] border text-[0.85rem] font-semibold transition-all hover:-translate-y-0.5 bg-secondary border-border text-foreground hover:border-muted hover:bg-card" href="/projects">See project archive</Link>
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
