interface SectionShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
  children: React.ReactNode;
}

export function SectionShell({ eyebrow, title, description, id, children }: SectionShellProps) {
  return (
    <section className="section-shell reveal" id={id}>
      <div className="section-heading">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      <div className="section-content">
        {children}
      </div>
    </section>
  );
}
