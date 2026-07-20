interface SectionShellProps {
  title: string;
  description?: string;
  id: string;
  children: React.ReactNode;
}

export function SectionShell({ title, description, id, children }: SectionShellProps) {
  return (
    <section className="scroll-mt-28 py-16 md:py-24" id={id}>
      <div className="max-w-2xl">
        <h2 className="text-[clamp(2.2rem,5vw,4.3rem)] font-semibold leading-[0.95] tracking-[-0.055em]">{title}</h2>
        {description && <p className="mt-4 max-w-[58ch] text-base leading-7 text-muted-foreground md:text-lg">{description}</p>}
      </div>
      <div className="mt-9 md:mt-12">{children}</div>
    </section>
  );
}
