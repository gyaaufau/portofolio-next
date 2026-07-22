import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { PixelOrnament } from "@/components/pixel-ornament";
import { PublicPageHeader } from "@/components/public-page-header";
import { absoluteUrl, siteConfig } from "@/data/seo";

const article = { title: "How to Build Scalable Flutter App Architecture", href: "/blog/how-to-build-scalable-flutter-app-architecture", description: "A practical guide to feature boundaries, clean architecture, state management, and performance-minded delivery." };
const blogSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Gialoop Blog", url: absoluteUrl("/blog"), description: "Flutter engineering notes from Gialoop.", isPartOf: { "@type": "WebSite", name: siteConfig.siteName, url: siteConfig.siteUrl } };
export const metadata: Metadata = { title: "Blog | Gialoop", description: "Practical Flutter engineering notes from Gialoop." };

export default function BlogPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1080px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <BackLink href="/" label="Home" />
      <PublicPageHeader eyebrow="DEV NOTES" title="Writing from the build." description="Practical notes on Flutter architecture, product delivery, and maintaining apps after launch." ornament="blog-notebook" />
      <Link href={article.href} className="group pixel-frame grid overflow-hidden bg-card md:grid-cols-[0.6fr_1.4fr]">
        <div className="pixel-grid relative grid min-h-56 place-items-center overflow-hidden bg-primary/10 p-6"><span className="absolute left-6 top-6 text-pixel text-[9px] text-primary">FEATURED READ</span><PixelOrnament name="abandoned-workstation-window" className="mt-8 w-48 max-w-[80%] opacity-90" /></div>
        <article className="p-6 md:p-10"><h2 className="text-3xl font-semibold tracking-[-0.04em] group-hover:text-primary md:text-4xl">{article.title}</h2><p className="mt-5 max-w-[56ch] leading-7 text-muted-foreground">{article.description}</p><span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">Read article <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span></article>
      </Link>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
    </main>
  );
}
