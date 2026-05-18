import Image from "next/image";
import Link from "next/link";
import type { ProjectItem } from "@/data/portfolio";

interface ProjectDetailViewProps {
  project: ProjectItem;
}

const projectTypeLabel = {
  personal: "Personal Project",
  work: "Work Project"
} as const;

const appTypeLabel = {
  mobile: "Mobile",
  web: "Web",
  "rest-api": "REST API"
} as const;

const typeChipStyles: Record<string, string> = {
  personal: "text-primary bg-primary/10 border-primary/20",
  work: "text-warning bg-warning/15",
};

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <article className="mt-4 p-5 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex justify-between gap-5 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-[0.55rem] mt-[0.6rem] mb-[0.9rem]">
            <span className={`inline-flex items-center min-h-[1.8rem] border border-border rounded-full px-[0.65rem] py-[0.3rem] text-[0.72rem] font-semibold ${typeChipStyles[project.projectType] || ""}`}>
              {projectTypeLabel[project.projectType]}
            </span>
            <span className="inline-flex items-center min-h-[1.8rem] border border-border rounded-full px-[0.65rem] py-[0.3rem] text-[0.72rem] font-semibold text-success bg-success/10 border-success/20">
              {appTypeLabel[project.appType]}
            </span>
            <span className="inline-flex items-center min-h-[2rem] text-[0.76rem] font-semibold text-primary">
              {project.periodShort}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {project.logo ? (
              <Image
                className="w-[4.5rem] h-[4.5rem] object-cover p-[0.45rem] flex-shrink-0 border border-border rounded-2xl bg-muted/10"
                src={project.logo.src}
                alt={project.logo.alt}
                width={project.logo.width || 72}
                height={project.logo.height || 72}
              />
            ) : (
              <div className="w-[4.5rem] h-[4.5rem] grid place-items-center flex-shrink-0 border border-border rounded-2xl bg-muted/10 text-primary text-[1rem] font-bold" aria-hidden="true">
                {project.title.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="m-0 text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.03em] font-bold">{project.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-[0.65rem] mt-4">
          {project.links.map((link) => (
            <Link
              key={link.href}
              className="inline-flex items-center justify-center min-h-[2.75rem] rounded-full px-5 py-[0.72rem] border text-[0.85rem] font-semibold transition-all hover:-translate-y-0.5 bg-secondary border-border text-foreground hover:border-muted hover:bg-card"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <p className="mt-4 m-0 text-muted-foreground leading-[1.8]">{project.summary}</p>

      {project.screenshots.length > 0 && (
        <div className="grid grid-cols-3 gap-[0.85rem] mt-6">
          {project.screenshots.map((image) => (
            <Image
              key={image.src}
              className="w-full max-h-[320px] border border-border rounded-[10px] bg-muted/5 object-contain"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 mt-6">
        {project.sections.map((section) => (
          <section key={section.title} className="border-t border-border pt-4">
            <h2 className="m-0 text-foreground text-[1.1rem] font-semibold">{section.title}</h2>
            {section.entries.map((entry, idx) => (
              <div key={idx} className="mt-[0.8rem]">
                {entry.title && <h3 className="m-0 mb-[0.55rem] text-primary text-[0.9rem] font-semibold">{entry.title}</h3>}
                {entry.paragraphs.map((paragraph, pidx) => <p key={pidx} className="mt-[0.55rem] m-0 text-muted-foreground leading-[1.7]">{paragraph}</p>)}
                {entry.bullets.length > 0 && (
                  <ul className="m-0 pl-[1.15rem]">
                    {entry.bullets.map((bullet, bidx) => <li key={bidx} className="mt-[0.6rem] text-muted-foreground">{bullet}</li>)}
                  </ul>
                )}
                {entry.codeBlocks.map((block, cidx) => (
                  <pre key={cidx} className="overflow-x-auto mt-[0.75rem] m-0 border border-border rounded-[10px] p-[0.9rem_1rem] bg-secondary text-foreground font-mono text-[0.78rem] leading-[1.6] whitespace-pre"><code>{block.content}</code></pre>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
