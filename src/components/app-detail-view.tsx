import Link from "next/link";
import { ChevronLeft, AppWindow, GitFork, Globe, ExternalLink, Smartphone } from "lucide-react";
import { StoreBadge } from "./store-badge";
import { ScreenshotCarousel } from "./screenshot-carousel";
import type { AppItem } from "@/data/types";

type AppDetailViewProps = {
  app: AppItem;
};

export function AppDetailView({ app }: AppDetailViewProps) {
  const storeLinks = [
    app.appStoreUrl && { icon: Smartphone, label: "App Store", href: app.appStoreUrl },
    app.playStoreUrl && { icon: AppWindow, label: "Play Store", href: app.playStoreUrl },
    app.websiteUrl && { icon: Globe, label: "Website", href: app.websiteUrl },
    app.githubUrl && { icon: GitFork, label: "GitHub", href: app.githubUrl },
    app.otherUrl && { icon: ExternalLink, label: app.otherUrlLabel ?? "Link", href: app.otherUrl },
  ].filter(Boolean) as { icon: React.ElementType; label: string; href: string }[];

  return (
    <div className="flex flex-col gap-8">
      {/* Back link */}
      <Link
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors w-fit"
        href="/apps"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> back / apps
      </Link>

      {/* Header */}
      <div className="flex gap-5 items-start">
        <img
          src={app.appIconSrc}
          alt={app.appIconAlt}
          width={80}
          height={80}
          className="rounded-2xl size-20 shrink-0 object-cover border border-border"
        />
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {app.title}
          </h1>
          <p className="text-muted-foreground mt-1">{app.tagline}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <StoreBadge type={app.appType} variant="app" />
            <StoreBadge type={app.workType} variant="work" />
            {app.featured && (
              <span className="badge-pixel text-primary">Featured</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{app.period}</p>
        </div>
      </div>

      {/* Screenshots */}
      <ScreenshotCarousel screenshots={app.screenshots} appTitle={app.title} />

      {/* Description */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-foreground">About</h2>
        <p className="text-muted-foreground leading-relaxed">{app.description}</p>
      </section>

      {/* Highlights */}
      {app.highlights.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Key Features</h2>
          <ul className="space-y-2.5">
            {app.highlights.map((h, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">&#9654;</span>
                <span className="leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tech Stack */}
      {app.stack.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {app.stack.map((t) => (
              <span
                key={t}
                className="badge-pixel text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Sections */}
      {app.sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-lg font-semibold mb-3 text-foreground">
            {section.title}
          </h2>
          {section.entries.map((entry, i) => (
            <div key={i} className="space-y-3">
              {entry.title && (
                <h3 className="text-base font-medium text-foreground">
                  {entry.title}
                </h3>
              )}
              {entry.paragraphs.map((p, j) => (
                <p key={j} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
              {entry.bullets.length > 0 && (
                <ul className="space-y-2">
                  {entry.bullets.map((b, k) => (
                    <li key={k} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary mt-0.5 shrink-0">&#9654;</span>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {entry.codeBlocks.map((cb, k) => (
                <pre
                  key={k}
                  className="p-4 rounded-lg bg-secondary text-sm overflow-x-auto font-mono text-foreground border border-border"
                >
                  <code>{cb.content}</code>
                </pre>
              ))}
            </div>
          ))}
        </section>
      ))}

      {/* Links */}
      {storeLinks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Links</h2>
          <div className="flex flex-wrap gap-3">
            {storeLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
                >
                  <Icon className="size-4" />
                  {link.label}
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
