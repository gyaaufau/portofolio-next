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
    <div className="certificates-shell">
      {(title || description) && (
        <div className="projects-group-head">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </div>
      )}

      <div className="certificate-list bento-grid-3" aria-label="Certificates">
        {certificates.map((certificate, index) => {
          const isFeatured = certificate.featured;
          const spanClass = isFeatured ? 'bento-span-2' : '';
          return (
            <Link 
              key={certificate.id}
              className={`certificate-card bento-item reveal reveal-delay-${Math.min(index + 1, 6)} ${spanClass}`} 
              href={`/certificates/${certificate.id}`}
            >
              <div className="certificate-card-top">
                <div className="certificate-card-meta">
                  {showFeaturedChip && isFeatured && <span className="project-featured-chip">Featured</span>}
                  <span className="certificate-type-chip">{certificate.type}</span>
                </div>
                <span className="certificate-issued">{certificate.issued}</span>
              </div>

              {certificate.image ? (
                <div className="certificate-card-preview">
                  <Image
                    src={certificate.image.src}
                    alt={certificate.image.alt}
                    width={certificate.image.width}
                    height={certificate.image.height}
                  />
                </div>
              ) : null}

              <div className="certificate-card-copy">
                <h3>{certificate.title}</h3>
                <p className="certificate-card-issuer">{certificate.issuer}</p>
                <p className="certificate-card-summary">{certificate.summary}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
