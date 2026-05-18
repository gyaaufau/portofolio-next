import type { WorkExperienceItem } from "@/data/portfolio";

interface WorkExperienceProps {
  experiences: WorkExperienceItem[];
}

export function WorkExperience({ experiences }: WorkExperienceProps) {
  const displayExperiences = [...experiences].sort((left, right) =>
    right.order - left.order
  );

  return (
    <div className="flex flex-col pl-6">
      {displayExperiences.map((experience, index) => {
        const isFirst = index === 0;
        const isLast = index === displayExperiences.length - 1;

        return (
          <div key={experience.company}>
            <div className="flex gap-10">
              {/* Timeline: Line + Dot */}
              <div className="flex flex-col items-center w-6 relative self-stretch">
                {/* Line from top to dot */}
                {isFirst ? (
                  <div className="w-0.5 bg-transparent flex-1"></div>
                ) : (
                  <div className="w-0.5 bg-[#E7E5E4] flex-1"></div>
                )}

                {/* Dot - same style for all */}
                <div className="w-3 h-3 rounded-full bg-primary border-card shadow-[0_0_0_2px_var(--primary)] z-10 shrink-0 my-1"></div>

                {/* Line from dot to bottom */}
                {isLast ? (
                  <div className="w-0.5 bg-transparent flex-1"></div>
                ) : (
                  <div className="w-0.5 bg-[#E7E5E4] flex-1"></div>
                )}
              </div>

              {/* Card */}
              <article
                className="flex-1 p-6 rounded-3xl bg-card border border-border shadow-sm hover:-translate-y-0.5 hover:border-muted hover:shadow-lg transition-all mb-6"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="m-0 text-lg font-semibold leading-tight text-foreground">
                        {experience.company}
                      </h3>
                    </div>
                    <span className="text-sm font-medium text-primary text-right shrink-0">
                      {experience.period}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs font-medium border border-border rounded-full px-3 py-1 bg-card text-muted-foreground">
                      {experience.role}
                    </span>
                    <span className="text-xs font-medium border border-border rounded-full px-3 py-1 bg-card text-muted-foreground">
                      {experience.location}
                    </span>
                  </div>

                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {experience.summary}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {experience.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        );
      })}
    </div>
  );
}
