import type { WorkExperienceItem } from "@/data/types";
import { getWorkExperiencePresentation } from "./work-experience-logic";
import styles from "./work-experience.module.css";

function WorkExperienceCard({ experience }: { experience: WorkExperienceItem }) {
  const { current, density, title, employmentType } = getWorkExperiencePresentation(experience);

  return (
    <article className={styles.card} data-density={density}>
      <div className={styles.topline}>
        <p className={styles.period}>{experience.period}</p>
        {current && (
          <span className={styles.currentBadge} aria-label="Current role">
            <span className={styles.currentBadgeDot} aria-hidden="true" />
            Current
          </span>
        )}
      </div>

      <div className={styles.cardContent}>
        <header className={styles.metadata}>
          <h3 className={styles.role}>{title}</h3>
          <p className={styles.companyLine}>
            <span>{experience.company}</span>
            {employmentType && <span className={styles.metadataDetail}>{employmentType}</span>}
          </p>
          {experience.location && <p className={styles.location}>{experience.location}</p>}
        </header>

        <div className={styles.description}>
          <p className={styles.summary}>{experience.summary}</p>
          {density === "expanded" && experience.highlights.length > 0 && (
            <div className={styles.contributions}>
              <p className={styles.contributionsLabel}>Key contributions</p>
              <ul className={styles.highlights}>
                {experience.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function WorkExperience({ experiences }: { experiences: WorkExperienceItem[] }) {
  const items = [...experiences].sort((left, right) => right.sortOrder - left.sortOrder);
  if (!items.length) return <p className="pixel-frame bg-card p-6 text-muted-foreground">No work history has been added yet.</p>;

  return (
    <div className={styles.timeline}>
      <div className="work-experience-vine" aria-hidden="true">
        <span className="work-experience-vine-cap" />
        <span className="work-experience-vine-repeat" />
        <span className="work-experience-vine-base" />
      </div>
      <ol className={styles.list} aria-label="Work experience timeline">
        {items.map((experience) => (
          <li key={experience.id} className={styles.item}>
            <span className={styles.node} aria-hidden="true" />
            <WorkExperienceCard experience={experience} />
          </li>
        ))}
      </ol>
    </div>
  );
}
