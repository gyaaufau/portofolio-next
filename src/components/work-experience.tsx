import type { WorkExperienceItem } from "@/data/types";

export function WorkExperience({ experiences }: { experiences: WorkExperienceItem[] }) {
  const items = [...experiences].sort((left, right) => right.sortOrder - left.sortOrder);
  if (!items.length) return <p className="pixel-frame bg-card p-6 text-muted-foreground">No work history has been added yet.</p>;

  return (
    <div className="relative border-l border-border pl-5 md:pl-8">
      {items.map((experience) => (
        <article key={experience.id} className="relative pb-10 last:pb-0">
          <span className="absolute -left-[1.72rem] top-1.5 size-3 bg-primary shadow-[2px_2px_0_var(--pixel-shadow)] md:-left-[2.36rem]" aria-hidden="true" />
          <div className="grid gap-3 md:grid-cols-[12rem_1fr] md:gap-8">
            <div>
              <p className="text-pixel text-[8px] text-primary">{experience.period}</p>
              <p className="mt-2 text-sm text-muted-foreground">{experience.location}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.025em]">{experience.role}</h3>
              <p className="mt-1 font-medium text-muted-foreground">{experience.company}</p>
              <p className="mt-4 max-w-[66ch] leading-7 text-muted-foreground">{experience.summary}</p>
              {experience.highlights.length > 0 && (
                <ul className="mt-4 grid gap-2 md:grid-cols-2">
                  {experience.highlights.map((highlight) => <li key={highlight} className="border-l-2 border-primary/50 pl-3 text-sm leading-6 text-muted-foreground">{highlight}</li>)}
                </ul>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
