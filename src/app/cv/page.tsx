import { Navbar } from "@/components/navbar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV | Argya Aulia Fauzandika",
  description: "Local PDF viewer for Argya Aulia Fauzandika's resume.",
  robots: "noindex, nofollow",
};

export default function CVPage() {
  const cvFile = "/data/myself/CV_ARGYA AULIA FAUZANDIKA.pdf";

  return (
    <main className="cv-page-shell">
      <Navbar />
      
      <section className="project-page-top panel">
        <Link className="back-link" href="/">back / home</Link>
      </section>

      <section className="cv-viewer panel">
        <div className="cv-viewer-head">
          <div>
            <p className="section-label">Resume PDF</p>
            <h1>Curriculum Vitae</h1>
            <p>Buka CV langsung dari portfolio ini.</p>
          </div>
          <div className="cv-viewer-actions">
            <Link className="button-link primary" href={cvFile} target="_blank" rel="noreferrer" download>
              Download PDF
            </Link>
          </div>
        </div>

        <div className="cv-viewer-frame-shell">
          <object className="cv-viewer-frame" data={cvFile} type="application/pdf">
            <div className="cv-viewer-fallback">
              <p>Browser ini belum bisa render PDF di dalam halaman.</p>
              <div className="cv-viewer-actions">
                <Link className="back-link" href="/">back / home</Link>
                <Link className="button-link primary" href={cvFile} target="_blank" rel="noreferrer">
                  Open PDF
                </Link>
              </div>
            </div>
          </object>
        </div>
      </section>
    </main>
  );
}
