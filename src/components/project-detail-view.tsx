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

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <article className="project-page-detail panel">
      <div className="project-page-head">
        <div className="project-page-title">
          <div className="project-meta-row">
            <span className={`project-type-chip project-type-chip-${project.projectType}`}>
              {projectTypeLabel[project.projectType]}
            </span>
            <span className="project-type-chip project-app-chip">
              {appTypeLabel[project.appType]}
            </span>
            <span className="project-period-value">{project.periodShort}</span>
          </div>
          <div className="project-brand-row">
            {project.logo ? (
              <Image
                className="project-detail-logo"
                src={project.logo.src}
                alt={project.logo.alt}
                width={project.logo.width || 72}
                height={project.logo.height || 72}
              />
            ) : (
              <div className="project-detail-logo project-detail-logo-fallback" aria-hidden="true">
                {project.title.slice(0, 1)}
              </div>
            )}
            <div className="project-heading-copy">
              <h1>{project.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {project.links.length > 0 && (
        <div className="project-action-row">
          {project.links.map((link) => (
            <Link 
              key={link.href}
              className="button-link secondary" 
              href={link.href} 
              target="_blank" 
              rel="noreferrer"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <p className="project-page-summary">{project.summary}</p>

      {project.screenshots.length > 0 && (
        <div className="project-gallery">
          {project.screenshots.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
            />
          ))}
        </div>
      )}

      <div className="project-sections">
        {project.sections.map((section) => (
          <section key={section.title} className="project-content-section">
            <h2>{section.title}</h2>
            {section.entries.map((entry, idx) => (
              <div key={idx} className="project-content-entry">
                {entry.title && <h3>{entry.title}</h3>}
                {entry.paragraphs.map((paragraph, pidx) => <p key={pidx}>{paragraph}</p>)}
                {entry.bullets.length > 0 && (
                  <ul className="detail-points">
                    {entry.bullets.map((bullet, bidx) => <li key={bidx}>{bullet}</li>)}
                  </ul>
                )}
                {entry.codeBlocks.map((block, cidx) => (
                  <pre key={cidx} className="project-code-block"><code>{block.content}</code></pre>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
