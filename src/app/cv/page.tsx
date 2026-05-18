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
    <main className="grid gap-6 w-full max-w-[1200px] mx-auto px-4 pt-6 pb-8">
      
      <section className="mt-4 p-5 rounded-xl bg-card border border-border shadow-sm">
        <Link className="text-primary text-[0.82rem] font-semibold lowercase" href="/">back / home</Link>
      </section>

      <section className="relative rounded-3xl p-6 bg-card border border-border shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-muted-foreground text-[0.8rem] font-semibold tracking-[0.06em] uppercase mb-[0.75rem]">Resume PDF</p>
            <h1 className="m-0 text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em] font-bold">Curriculum Vitae</h1>
            <p>Buka CV langsung dari portfolio ini.</p>
          </div>
          <div className="flex flex-wrap justify-end gap-[0.65rem]">
            <Link className="inline-flex items-center justify-center min-h-[2.75rem] rounded-full px-5 py-[0.72rem] border text-[0.85rem] font-semibold transition-all hover:-translate-y-0.5 bg-primary text-primary-foreground border-transparent hover:bg-primary/90" href={cvFile} target="_blank" rel="noreferrer" download>
              Download PDF
            </Link>
          </div>
        </div>

        <div className="min-h-[78vh] border border-border rounded-[18px] overflow-hidden bg-secondary">
          <object className="w-full min-h-[78vh]" data={cvFile} type="application/pdf">
            <div className="grid place-items-center gap-[0.8rem] min-h-[78vh] p-6 text-center">
              <p>Browser ini belum bisa render PDF di dalam halaman.</p>
              <div className="flex flex-wrap justify-end gap-[0.65rem]">
                <Link className="text-primary text-[0.82rem] font-semibold lowercase" href="/">back / home</Link>
                <Link className="inline-flex items-center justify-center min-h-[2.75rem] rounded-full px-5 py-[0.72rem] border text-[0.85rem] font-semibold transition-all hover:-translate-y-0.5 bg-primary text-primary-foreground border-transparent hover:bg-primary/90" href={cvFile} target="_blank" rel="noreferrer">
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
