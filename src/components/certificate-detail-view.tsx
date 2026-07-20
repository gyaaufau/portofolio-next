import Image from "next/image";
import { BackLink } from "./back-link";
import type { CertificateItem } from "@/data/types";

export function CertificateDetailView({ certificate }: { certificate: CertificateItem }) {
  return (
    <article>
      <BackLink href="/certificates" label="All certificates" />
      <header className="max-w-4xl py-12 md:py-16">
        <div className="flex flex-wrap gap-4 text-pixel text-[8px] text-primary"><span>{certificate.type}</span><span>{certificate.issued}</span></div>
        <h1 className="mt-6 text-[clamp(3rem,7vw,6.4rem)] font-semibold leading-[0.92] tracking-[-0.06em]">{certificate.title}</h1>
        <p className="mt-5 text-lg font-semibold text-primary">{certificate.issuer}</p>
        <p className="mt-5 max-w-[66ch] text-lg leading-8 text-muted-foreground">{certificate.summary}</p>
      </header>
      {certificate.image && <div className="pixel-frame bg-card p-3"><Image src={certificate.image.src} alt={certificate.image.alt} width={certificate.image.width} height={certificate.image.height} className="mx-auto max-h-[720px] w-full rounded-[4px] object-contain" priority /></div>}
      <div className="grid gap-10 py-14 md:grid-cols-2 md:py-20">
        <section><h2 className="text-2xl font-semibold tracking-[-0.035em]">About the issuer</h2><div className="mt-5 space-y-3">{certificate.issuerNotes.map((note) => <p key={note} className="border-l-2 border-primary/60 pl-4 leading-7 text-muted-foreground">{note}</p>)}</div></section>
        <section><h2 className="text-2xl font-semibold tracking-[-0.035em]">What it represents</h2><div className="mt-5 space-y-3">{certificate.details.map((detail) => <p key={detail} className="border-l-2 border-border pl-4 leading-7 text-muted-foreground">{detail}</p>)}</div></section>
        <section className="pixel-frame pixel-grid bg-card p-6 md:col-span-2 md:p-8"><h2 className="text-2xl font-semibold tracking-[-0.035em]">Why it matters</h2><p className="mt-4 max-w-[68ch] text-lg leading-8 text-muted-foreground">{certificate.relevance}</p></section>
      </div>
    </article>
  );
}
