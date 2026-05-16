import type { WorkExperienceItem } from "@/data/portfolio";

interface WorkExperienceProps {
  experiences: WorkExperienceItem[];
}

export function WorkExperience({ experiences }: WorkExperienceProps) {
  const displayExperiences = [...experiences].sort((left, right) => right.order - left.order);

  return (
    <div className="flex flex-col gap-6">
      {displayExperiences.map((experience, index) => {
        const isLast = index === displayExperiences.length - 1;
        return (
          <div key={experience.company} className="flex gap-6">
            <div className="flex flex-col items-center w-6 relative">
              <div className="timeline-dot z-10 mt-6"></div>
              
              {!isLast ? (
                <div className="timeline-line flex-1 mt-2"></div>
              ) : (
                <div className="timeline-line h-4 mt-2"></div>
              )}
            </div>
            
            <article className={`flex-1 p-6 rounded-2xl bg-panel-primary border border-line-primary shadow-sm hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg transition-all reveal reveal-delay-${Math.min(index + 1, 6)}`}>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="m-0 text-lg font-semibold leading-tight">{experience.company}</h3>
                  </div>
                  <span className="text-sm font-medium text-accent text-right">{experience.period}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs font-medium border border-line-primary rounded-full px-3 py-1 bg-bg-primary text-muted-primary">{experience.role}</span>
                  <span className="text-xs font-medium border border-line-primary rounded-full px-3 py-1 bg-bg-primary text-muted-primary">{experience.location}</span>
                </div>

                <p className="mt-3 text-muted-primary leading-relaxed">{experience.summary}</p>

                <ul className="mt-3 pl-5 space-y-1">
                  {experience.highlights.map((highlight, idx) => <li key={idx} className="text-sm text-muted-primary">{highlight}</li>)}
                </ul>
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
