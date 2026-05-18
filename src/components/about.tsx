import { Smartphone, Puzzle, HeartHandshake } from "lucide-react";

interface AboutProps {
  paragraphs: string[];
  skills?: string[];
  tech?: string[];
  softSkills?: string[];
}

export function About({ paragraphs, skills = [], tech = [], softSkills = [] }: AboutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
      {/* Paragraph — full width with teal accent bar */}
      {paragraphs.map((paragraph, index) => (
        <div key={index} className="md:col-span-2 bg-card border border-border rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg">
          <div className="border-l-2 border-primary pl-4 md:pl-5">
            <p className="text-foreground leading-relaxed text-sm md:text-base">
              {paragraph}
            </p>
          </div>
        </div>
      ))}

      {/* Mobile Development — left column, taller on desktop */}
      <div className="md:row-span-2 bg-card border border-border rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg">
        <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-5">
          <div className="flex items-center justify-center size-9 rounded-xl bg-secondary text-muted-foreground shrink-0">
            <Smartphone className="size-4" />
          </div>
            <p className="text-muted-foreground text-[0.7rem] md:text-[0.8rem] font-semibold tracking-[0.06em] uppercase">Mobile Development</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((item, idx) => (
            <span key={idx} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Tools & Integration — top right on desktop */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg">
        <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-5">
          <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary shrink-0">
            <Puzzle className="size-4" />
          </div>
          <p className="text-muted-foreground text-[0.7rem] md:text-[0.8rem] font-semibold tracking-[0.06em] uppercase">Tools & Integration</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tech.map((item, idx) => (
            <span key={idx} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-semibold">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Soft Skills — bottom right on desktop */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg">
        <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-5">
          <div className="flex items-center justify-center size-9 rounded-xl bg-secondary text-muted-foreground shrink-0">
            <HeartHandshake className="size-4" />
          </div>
          <p className="text-muted-foreground text-[0.7rem] md:text-[0.8rem] font-semibold tracking-[0.06em] uppercase">Soft Skills</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {softSkills.map((item, idx) => (
            <span key={idx} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
