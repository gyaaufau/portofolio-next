import Link from "next/link";
import type { AppItem } from "@/data/types";

interface ProjectsProps {
  title?: string;
  description?: string;
  showFeaturedChip?: boolean;
  projects: AppItem[];
}

const workTypeLabel = {
  personal: "Personal",
  work: "Work"
} as const;

const appTypeLabel: Record<string, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  web: "Web",
  backend: "Backend",
};

const typeChipStyles: Record<string, string> = {
  personal: "text-primary bg-primary/10",
  work: "text-warning bg-warning/15",
};

export function Projects({ title, description, showFeaturedChip = false, projects }: ProjectsProps) {
  return (
    <div className="grid gap-6">
      {(title || description) && (
        <div className="grid gap-[0.45rem]">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Projects">
        {projects.map((project) => {
          const isFeatured = project.featured;
          return (
          <Link
            key={project.id}
            className="block bg-card border border-border rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg overflow-hidden"
            href={`/apps/${project.slug}`}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {showFeaturedChip && isFeatured && (
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10">
                  Featured
                </span>
              )}
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeChipStyles[project.workType] || ""}`}>
                {workTypeLabel[project.workType]}
              </span>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-success bg-success/10">
                {appTypeLabel[project.appType] || project.appType}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{project.periodShort}</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <img
                className="w-14 h-14 object-cover shrink-0 border border-border rounded-2xl bg-muted/10"
                src={project.appIconSrc}
                alt={project.appIconAlt}
                width={56}
                height={56}
              />
              <h3 className="text-lg font-semibold leading-snug">{project.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{project.tagline}</p>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
