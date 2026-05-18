import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectItem } from "@/data/portfolio";

interface ProjectDetailViewProps {
  project: ProjectItem;
}

const projectTypeLabel = {
  personal: "Personal",
  work: "Work"
} as const;

const appTypeLabel = {
  mobile: "Mobile",
  web: "Web",
  "rest-api": "REST API"
} as const;

const typeChipStyles: Record<string, string> = {
  personal: "text-primary bg-primary/10",
  work: "text-warning bg-warning/15",
};

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <article className="mt-4 p-6 rounded-3xl bg-card border border-border shadow-sm">
      <Link className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors w-fit mb-6" href="/projects">
        <ChevronLeft className="w-3.5 h-3.5" /> back / projects
      </Link>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeChipStyles[project.projectType] || ""}`}>
          {projectTypeLabel[project.projectType]}
        </span>
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-success bg-success/10">
          {appTypeLabel[project.appType]}
        </span>
        <span className="text-xs font-semibold text-primary ml-auto">{project.periodShort}</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {project.logo ? (
          <Image
            className="w-16 h-16 object-cover p-2 shrink-0 border border-border rounded-2xl bg-muted/10"
            src={project.logo.src}
            alt={project.logo.alt}
            width={project.logo.width || 64}
            height={project.logo.height || 64}
          />
        ) : (
          <div className="w-16 h-16 grid place-items-center shrink-0 border border-border rounded-2xl bg-muted/10 text-primary font-bold" aria-hidden="true">
            {project.title.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.03em] font-bold">{project.title}</h1>
        </div>
      </div>

      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {project.links.map((link, i) => (
            <Link
              key={link.href}
              className={`inline-flex items-center justify-center h-11 rounded-full px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                i === 0
                  ? "bg-primary text-primary-foreground border border-transparent hover:bg-primary/90"
                  : "bg-secondary border border-border text-foreground hover:border-muted hover:bg-card"
              }`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="border-l-2 border-primary pl-5 mb-6">
        <p className="text-muted-foreground leading-relaxed">{project.summary}</p>
      </div>

      {project.screenshots.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {project.screenshots.map((image) => (
            <Image
              key={image.src}
              className="w-full max-h-[320px] border border-border rounded-2xl bg-muted/5 object-contain"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
            />
          ))}
        </div>
      )}

      <div className="grid gap-6">
        {project.sections.map((section) => (
          <section key={section.title} className="border-t border-border pt-5">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-foreground mb-4">
              <span className="w-1 h-5 rounded-full bg-primary shrink-0" />
              {section.title}
            </h2>
            {section.entries.map((entry, idx) => (
              <div key={idx} className="mt-3 first:mt-0">
                {entry.title && <h3 className="text-sm font-semibold text-primary mb-2">{entry.title}</h3>}
                {entry.paragraphs.map((paragraph, pidx) => (
                  <p key={pidx} className="text-sm text-muted-foreground leading-relaxed mt-2 first:mt-0">{paragraph}</p>
                ))}
                {entry.bullets.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {entry.bullets.map((bullet, bidx) => (
                      <div key={bidx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
                {entry.codeBlocks.map((block, cidx) => (
                  <pre key={cidx} className="overflow-x-auto mt-3 border border-border rounded-xl p-4 bg-secondary text-foreground font-mono text-xs leading-relaxed whitespace-pre">
                    <code>{block.content}</code>
                  </pre>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
