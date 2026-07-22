interface SectionShellProps {
  title: string;
  description?: string;
  id: string;
  children: React.ReactNode;
  headingAdornment?: React.ReactNode;
  asideAdornment?: React.ReactNode;
}

export function SectionShell({ title, description, id, children, headingAdornment, asideAdornment }: SectionShellProps) {
  return (
    <section className="scroll-mt-28 py-16 md:py-24" id={id}>
      <div className={asideAdornment ? "grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto]" : "max-w-2xl"}>
        <div className="max-w-2xl">
          <div className="flex items-start gap-4 md:gap-5">
            {headingAdornment && <div className="mt-0.5 shrink-0 md:mt-1">{headingAdornment}</div>}
            <h2 className="text-[clamp(2.2rem,5vw,4.3rem)] font-semibold leading-[0.95] tracking-[-0.055em]">{title}</h2>
          </div>
          {description && <p className="mt-4 max-w-[58ch] text-base leading-7 text-muted-foreground md:text-lg">{description}</p>}
        </div>
        {asideAdornment && <div className="justify-self-end">{asideAdornment}</div>}
      </div>
      <div className="mt-9 md:mt-12">{children}</div>
    </section>
  );
}
