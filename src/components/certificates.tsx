import Image from "next/image";
import Link from "next/link";
import type { CertificateItem } from "@/data/types";

export function Certificates({ certificates }: { title?: string; description?: string; showFeaturedChip?: boolean; certificates: CertificateItem[] }) {
  if (!certificates.length) return <div className="pixel-frame pixel-grid bg-card p-8 text-center md:p-12"><p className="text-pixel text-[9px] text-primary">EMPTY ROOM</p><p className="mt-4 text-muted-foreground">No certificates have been added yet.</p></div>;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12" aria-label="Certificates">
      {certificates.map((certificate, index) => (
        <Link key={certificate.id} href={`/certificates/${certificate.id}`} className={`group pixel-frame overflow-hidden bg-card ${index % 3 === 0 ? "md:col-span-7" : index % 3 === 1 ? "md:col-span-5" : "md:col-span-12 md:grid md:grid-cols-[18rem_1fr]"}`}>
          {certificate.image && (
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary md:aspect-auto md:min-h-56">
              <Image src={certificate.image.src} alt={certificate.image.alt} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            </div>
          )}
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{certificate.type}</span><span>{certificate.issued}</span></div>
            <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] group-hover:text-primary">{certificate.title}</h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{certificate.issuer}</p>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{certificate.summary}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
