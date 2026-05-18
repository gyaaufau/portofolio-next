interface SectionShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
  children: React.ReactNode;
}

export function SectionShell({ eyebrow, title, description, id, children }: SectionShellProps) {
  return (
    <section className="relative z-[1] mt-6 rounded-3xl p-6 bg-card border border-border shadow-sm" id={id}>
      <div className="grid gap-[0.7rem] max-w-[46rem]">
        <p className="m-0 mb-[0.75rem] text-primary text-[0.8rem] font-semibold tracking-[0.06em] uppercase">
          {eyebrow}
        </p>
        <h2 className="m-0 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] tracking-[-0.03em] font-bold">
          {title}
        </h2>
        {description && <p className="m-0 text-[1.05rem] text-muted-foreground leading-[1.7]">{description}</p>}
      </div>
      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}
