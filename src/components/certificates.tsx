import Link from "next/link";
import Image from "next/image";
import type { CertificateItem } from "@/data/portfolio";

interface CertificatesProps {
  title?: string;
  description?: string;
  showFeaturedChip?: boolean;
  certificates: CertificateItem[];
}

export function Certificates({ title, description, showFeaturedChip = false, certificates }: CertificatesProps) {
  return (
    <div>
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-xl font-semibold text-foreground">{title}</h3>}
          {description && <p className="mt-2 text-muted-foreground">{description}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Certificates">
        {certificates.map((certificate) => (
            <Link 
              key={certificate.id}
              className="bg-card border border-border rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-lg overflow-hidden block" 
              href={`/certificates/${certificate.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {showFeaturedChip && certificate.featured && <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-[#FAFAF9] text-muted-foreground">Featured</span>}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-[#FAFAF9] text-muted-foreground">{certificate.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">{certificate.issued}</span>
              </div>

              {certificate.image ? (
                <div className="mb-4 overflow-hidden rounded-lg aspect-[4/3]">
                  <Image
                    src={certificate.image.src}
                    alt={certificate.image.alt}
                    width={certificate.image.width}
                    height={certificate.image.height}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : null}

              <div>
                <h3 className="text-lg font-semibold text-foreground">{certificate.title}</h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">{certificate.issuer}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{certificate.summary}</p>
              </div>
            </Link>
        ))}
      </div>
    </div>
  );
}
