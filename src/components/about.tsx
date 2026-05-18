interface AboutProps {
  paragraphs: string[];
  skills?: string[];
  tech?: string[];
  softSkills?: string[];
}

export function About({ paragraphs, skills = [], tech = [], softSkills = [] }: AboutProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 w-full">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="col-span-full bg-card border border-border rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg overflow-hidden text-muted-foreground leading-relaxed">
          {paragraph}
        </p>
      ))}
      <div className="bg-card border border-border rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg overflow-hidden">
        <p className="text-muted-foreground text-[0.8rem] font-semibold tracking-[0.06em] uppercase mb-[0.75rem]">Skills</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {skills.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg overflow-hidden">
        <p className="text-muted-foreground text-[0.8rem] font-semibold tracking-[0.06em] uppercase mb-[0.75rem]">Tech</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {tech.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </div>
      
      <div className="bg-card border border-border rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg overflow-hidden">
        <p className="text-muted-foreground text-[0.8rem] font-semibold tracking-[0.06em] uppercase mb-[0.75rem]">Soft Skills</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {softSkills.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
