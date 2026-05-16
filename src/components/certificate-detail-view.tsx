import Image from "next/image";
import type { CertificateItem } from "@/data/portfolio";

interface CertificateDetailViewProps {
  certificate: CertificateItem;
}

export function CertificateDetailView({ certificate }: CertificateDetailViewProps) {
  return (
    <article className="project-page-detail panel">
      <div className="certificate-detail-head">
        <div className="project-meta-row">
          <span className="certificate-type-chip">{certificate.type}</span>
          <span className="project-period-value">{certificate.issued}</span>
        </div>

        <div className="certificate-detail-title">
          <div className="certificate-detail-copy">
            <h1>{certificate.title}</h1>
            <p className="certificate-detail-issuer">{certificate.issuer}</p>
          </div>
        </div>
      </div>

      <p className="project-page-summary">{certificate.summary}</p>

      {certificate.image && (
        <div className="certificate-detail-preview">
          <Image
            src={certificate.image.src}
            alt={certificate.image.alt}
            width={certificate.image.width}
            height={certificate.image.height}
          />
        </div>
      )}

      <div className="project-sections">
        <section className="project-content-section">
          <h2>Issuer</h2>
          <div className="project-content-entry">
            <ul className="detail-points">
              {certificate.issuerNotes.map((note, idx) => <li key={idx}>{note}</li>)}
            </ul>
          </div>
        </section>

        {certificate.details.length > 0 && (
          <section className="project-content-section">
            <h2>What This Certificate Represents</h2>
            <div className="project-content-entry">
              <ul className="detail-points">
                {certificate.details.map((detail, idx) => <li key={idx}>{detail}</li>)}
              </ul>
            </div>
          </section>
        )}

        <section className="project-content-section">
          <h2>Relevance</h2>
          <div className="project-content-entry">
            <p>{certificate.relevance}</p>
          </div>
        </section>
      </div>
    </article>
  );
}
