import Link from "next/link";
import Image from "next/image";
import type { ProjectItem } from "@/data/portfolio";

interface ProjectsProps {
  title?: string;
  description?: string;
  showFeaturedChip?: boolean;
  projects: ProjectItem[];
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
  personal: "text-primary bg-primary/10 border-primary/20",
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
            className="block text-left bg-card border border-border rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg overflow-hidden"
              href={`/projects/${project.id}`}
            >
              <div className="flex flex-wrap gap-[0.5rem] mb-4">
                {showFeaturedChip && isFeatured && (
                  <span className="inline-flex items-center min-h-[1.8rem] border border-border rounded-full px-[0.65rem] py-[0.3rem] text-warning bg-warning/15 text-[0.72rem] font-semibold">
                    Featured
                  </span>
                )}
                <span
                  className={`inline-flex items-center min-h-[1.8rem] border border-border rounded-full px-[0.65rem] py-[0.3rem] text-[0.72rem] font-semibold ${typeChipStyles[project.projectType] || ""}`}
                >
                  {projectTypeLabel[project.projectType]}
                </span>
                <span className="inline-flex items-center min-h-[1.8rem] border border-border rounded-full px-[0.65rem] py-[0.3rem] text-[0.72rem] font-semibold text-success bg-success/10 border-success/20">
                  {appTypeLabel[project.appType]}
                </span>
              </div>
              <span className="m-0 text-primary text-[0.8rem] font-semibold tracking-[0.04em] inline-flex mb-[0.7rem]">{project.periodShort}</span>
              <div className="flex items-center gap-[0.75rem]">
                <div className="flex items-center gap-[0.75rem] min-w-0">
                  {project.logo ? (
                    <Image
                      className="w-12 h-12 object-cover p-[0.35rem] flex-shrink-0 border border-border rounded-2xl bg-muted/10"
                      src={project.logo.src}
                      alt={project.logo.alt}
                      width={project.logo.width || 48}
                      height={project.logo.height || 48}
                    />
                  ) : (
                    <div className="w-12 h-12 grid place-items-center flex-shrink-0 border border-border rounded-2xl bg-muted/10 text-primary text-[1rem] font-bold" aria-hidden="true">
                      {project.title.slice(0, 1)}
                    </div>
                  )}
                  <h3 className="m-0 text-[1.15rem] leading-[1.2] font-semibold">{project.title}</h3>
                </div>
              </div>
              <p className="mt-[0.85rem] m-0 line-clamp-4">{project.summary}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
