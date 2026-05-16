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

export function Projects({ title, description, showFeaturedChip = false, projects }: ProjectsProps) {
  return (
    <div className="projects-shell">
      {(title || description) && (
        <div className="projects-group-head">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </div>
      )}
      <div className="project-list bento-grid" aria-label="Projects">
        {projects.map((project, index) => {
          const isFeatured = project.featured;
          const spanClass = isFeatured ? 'bento-span-2 bento-row-2' : '';
          return (
            <Link
              key={project.id}
              className={`project-card bento-item reveal reveal-delay-${Math.min(index + 1, 6)} ${spanClass}`}
              href={`/projects/${project.id}`}
            >
              <div className="project-card-meta">
                {showFeaturedChip && isFeatured && <span className="project-featured-chip">Featured</span>}
                <span className={`project-type-chip project-type-chip-${project.projectType}`}>
                  {projectTypeLabel[project.projectType]}
                </span>
                <span className="project-type-chip project-app-chip">
                  {appTypeLabel[project.appType]}
                </span>
              </div>
              <span className="project-period project-card-period">{project.periodShort}</span>
              <div className="project-card-title-row">
                <div className="project-card-brand">
                  {project.logo ? (
                    <Image
                      className="project-card-logo"
                      src={project.logo.src}
                      alt={project.logo.alt}
                      width={project.logo.width || 48}
                      height={project.logo.height || 48}
                    />
                  ) : (
                    <div className="project-card-logo project-card-logo-fallback" aria-hidden="true">
                      {project.title.slice(0, 1)}
                    </div>
                  )}
                  <h3>{project.title}</h3>
                </div>
              </div>
              <p>{project.summary}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
