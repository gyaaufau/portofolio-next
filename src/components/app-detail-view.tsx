import Image from "next/image";
import { AppWindow, ExternalLink, GitFork, Globe, Smartphone } from "lucide-react";
import { BackLink } from "./back-link";
import { StoreBadge } from "./store-badge";
import { ScreenshotCarousel } from "./screenshot-carousel";
import { PixelOrnament } from "./pixel-ornament";
import type { AppItem } from "@/data/types";

export function AppDetailView({ app }: { app: AppItem }) {
  const links = [
    app.appStoreUrl && { icon: Smartphone, label: "App Store", href: app.appStoreUrl },
    app.playStoreUrl && { icon: AppWindow, label: "Play Store", href: app.playStoreUrl },
    app.websiteUrl && { icon: Globe, label: "Website", href: app.websiteUrl },
    app.githubUrl && { icon: GitFork, label: "GitHub", href: app.githubUrl },
    app.otherUrl && { icon: ExternalLink, label: app.otherUrlLabel ?? "Open link", href: app.otherUrl },
  ].filter(Boolean) as { icon: React.ElementType; label: string; href: string }[];

  return (
    <article>
      <BackLink href="/apps" label="All apps" />
      <header className="grid gap-8 py-12 md:grid-cols-[1fr_auto] md:items-end md:py-16">
        <div>
          <div className="flex items-center gap-4">
            <Image src={app.appIconSrc} alt={app.appIconAlt} width={96} height={96} className="size-20 rounded-[6px] border border-border object-cover md:size-24" priority />
            <div className="flex flex-wrap gap-2"><StoreBadge type={app.appType} variant="app" /><StoreBadge type={app.workType} variant="work" /></div>
          </div>
          <h1 className="mt-7 text-[clamp(3.2rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">{app.title}</h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-8 text-muted-foreground">{app.tagline}</p>
        </div>
        <p className="text-pixel text-[8px] leading-5 text-primary">{app.period}</p>
      </header>

      <ScreenshotCarousel screenshots={app.screenshots} appTitle={app.title} />

      <div className="mx-auto mt-8 flex max-w-3xl justify-center overflow-hidden" aria-hidden="true">
        <PixelOrnament name="weathered-conduit" className="w-96 max-w-full md:w-[768px]" />
      </div>

      <div className="grid gap-12 py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <aside>
          <h2 className="text-pixel text-[9px] text-primary">BUILD KIT</h2>
          <div className="mt-5 flex flex-wrap gap-2">{app.stack.map((item) => <span key={item} className="rounded-[4px] border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">{item}</span>)}</div>
          {links.length > 0 && <div className="mt-8 flex flex-col items-start gap-3">{links.map(({ icon: Icon, ...link }) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="pixel-button bg-card"><Icon className="size-4" />{link.label}</a>)}</div>}
        </aside>
        <div className="space-y-14">
          <section><h2 className="text-3xl font-semibold tracking-[-0.04em]">About the app</h2><p className="mt-5 max-w-[68ch] text-lg leading-8 text-muted-foreground">{app.description}</p></section>
          {app.highlights.length > 0 && <section><h2 className="text-3xl font-semibold tracking-[-0.04em]">What it does</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{app.highlights.map((item) => <p key={item} className="border-l-2 border-primary/60 pl-4 leading-7 text-muted-foreground">{item}</p>)}</div></section>}
          {app.sections.map((section) => <section key={section.title}><h2 className="text-3xl font-semibold tracking-[-0.04em]">{section.title}</h2><div className="mt-5 space-y-6">{section.entries.map((entry, index) => <div key={`${section.title}-${index}`} className="space-y-4">{entry.title && <h3 className="text-lg font-semibold">{entry.title}</h3>}{entry.paragraphs.map((paragraph) => <p key={paragraph} className="max-w-[68ch] leading-8 text-muted-foreground">{paragraph}</p>)}{entry.bullets.length > 0 && <div className="grid gap-3">{entry.bullets.map((bullet) => <p key={bullet} className="border-l-2 border-border pl-4 leading-7 text-muted-foreground">{bullet}</p>)}</div>}{entry.codeBlocks.map((block, blockIndex) => <pre key={blockIndex} className="overflow-x-auto rounded-[4px] border border-border bg-secondary p-4 text-sm"><code>{block.content}</code></pre>)}</div>)}</div></section>)}
        </div>
      </div>
    </article>
  );
}
