import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { absoluteUrl, siteConfig } from "@/data/seo";

const article = { title: "How to Build Scalable Flutter App Architecture", href: "/blog/how-to-build-scalable-flutter-app-architecture", description: "A practical guide to feature boundaries, clean architecture, state management, and performance-minded delivery." };
const blogSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Gialoop Blog", url: absoluteUrl("/blog"), description: "Flutter engineering notes from Gialoop.", isPartOf: { "@type": "WebSite", name: siteConfig.siteName, url: siteConfig.siteUrl } };
export const metadata: Metadata = { title: "Blog | Gialoop", description: "Practical Flutter engineering notes from Gialoop." };

export default function BlogPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1080px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <BackLink href="/" label="Home" />
      <header className="max-w-3xl py-14 md:py-20"><p className="text-pixel text-[9px] text-primary">DEV NOTES</p><h1 className="mt-5 text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">Writing from the build.</h1><p className="mt-6 max-w-[58ch] text-lg leading-8 text-muted-foreground">Practical notes on Flutter architecture, product delivery, and maintaining apps after launch.</p></header>
      <Link href={article.href} className="group pixel-frame grid overflow-hidden bg-card md:grid-cols-[0.6fr_1.4fr]">
        <div className="pixel-grid min-h-56 bg-primary/10 p-6"><span className="text-pixel text-[9px] text-primary">FEATURED READ</span></div>
        <article className="p-6 md:p-10"><h2 className="text-3xl font-semibold tracking-[-0.04em] group-hover:text-primary md:text-4xl">{article.title}</h2><p className="mt-5 max-w-[56ch] leading-7 text-muted-foreground">{article.description}</p><span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">Read article <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span></article>
      </Link>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
    </main>
  );
}
