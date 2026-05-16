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
          <div key={experience.company}>  {/* Spacing handle oleh parent SectionShell */}
            <div className="flex gap-10">
              {/* Timeline: Line + Dot */}
              <div className="flex flex-col items-center w-6 relative self-stretch">
                {/* Line from top to dot */}
                {isFirst ? (
                  <div className="w-0.5 bg-transparent flex-1"></div>
                ) : (
                  <div className="w-0.5 bg-[var(--line)] flex-1"></div>
                )}

                {/* Dot - same style for all */}
                <div className="w-3 h-3 rounded-full bg-[var(--accent)] border-[3px] border-[var(--bg)] shadow-[0_0_0_2px_var(--accent)] z-10 shrink-0 my-1"></div>

                {/* Line from dot to bottom */}
                {isLast ? (
                  <div className="w-0.5 bg-transparent flex-1"></div>
                ) : (
                  <div className="w-0.5 bg-[var(--line)] flex-1"></div>
                )}
              </div>

              {/* Card */}
              <article
                className="flex-1 p-6 rounded-2xl bg-[var(--panel)] border border-[var(--line)] shadow-sm hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-lg transition-all mb-6"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="m-0 text-lg font-semibold leading-tight text-[var(--text)]">
                        {experience.company}
                      </h3>
                    </div>
                    <span className="text-sm font-medium text-[var(--accent)] text-right shrink-0">
                      {experience.period}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs font-medium border border-[var(--line)] rounded-full px-3 py-1 bg-[var(--bg)] text-[var(--muted)]">
                      {experience.role}
                    </span>
                    <span className="text-xs font-medium border border-[var(--line)] rounded-full px-3 py-1 bg-[var(--bg)] text-[var(--muted)]">
                      {experience.location}
                    </span>
                  </div>

                  <p className="mt-3 text-[var(--muted)] leading-relaxed">
                    {experience.summary}
                  </p>

                  <ul className="mt-3 pl-5 space-y-1">
                    {experience.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-[var(--muted)]">
                        {highlight}
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
