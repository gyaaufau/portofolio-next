import Image from "next/image";
import type { CertificateItem } from "@/data/portfolio";

interface CertificateDetailViewProps {
  certificate: CertificateItem;
}

export function CertificateDetailView({ certificate }: CertificateDetailViewProps) {
  return (
    <article className="mt-4 p-6 rounded-3xl bg-card border border-border shadow-sm">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2 mt-1 mb-3">
          <span className="inline-flex items-center h-7 border border-border rounded-full px-2.5 py-1 text-xs font-semibold text-success bg-secondary">
            {certificate.type}
          </span>
          <span className="inline-flex items-center text-sm font-semibold text-primary">
            {certificate.issued}
          </span>
        </div>

        <h1 className="text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.03em] font-bold">
          {certificate.title}
        </h1>
        <p className="text-primary text-sm font-semibold">{certificate.issuer}</p>
      </div>

      <p className="mt-4 text-muted-foreground leading-relaxed">{certificate.summary}</p>

      {certificate.image && (
        <div className="mt-4">
          <Image
            className="w-full h-auto max-h-[600px] border border-border rounded-lg bg-muted/5 object-contain"
            src={certificate.image.src}
            alt={certificate.image.alt}
            width={certificate.image.width}
            height={certificate.image.height}
          />
        </div>
      )}

      <div className="grid gap-6 mt-6 max-w-[65ch]">
        <section className="border-t border-border pt-5">
          <h2 className="text-foreground text-base font-semibold">Issuer</h2>
          <div className="mt-3">
            <ul className="pl-5">
              {certificate.issuerNotes.map((note, idx) => (
                <li key={idx} className="mt-1.5 text-muted-foreground">{note}</li>
              ))}
            </ul>
          </div>
        </section>

        {certificate.details.length > 0 && (
          <section className="border-t border-border pt-5">
            <h2 className="text-foreground text-base font-semibold">What This Certificate Represents</h2>
            <div className="mt-3">
              <ul className="pl-5">
                {certificate.details.map((detail, idx) => (
                  <li key={idx} className="mt-1.5 text-muted-foreground">{detail}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="border-t border-border pt-5">
          <h2 className="text-foreground text-base font-semibold">Relevance</h2>
          <div className="mt-3">
            <p>{certificate.relevance}</p>
          </div>
        </section>
      </div>
    </article>
  );
}
