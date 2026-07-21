import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { r2Url } from "@/lib/r2";

export const metadata: Metadata = { title: "CV | Argya Aulia Fauzandika", description: "Resume for Argya Aulia Fauzandika.", robots: "noindex, nofollow" };

export default function CVPage() {
  const cvFile = r2Url("/data/myself/CV_ARGYA AULIA FAUZANDIKA.pdf");
  return (
    <main id="main-content" className="mx-auto w-full max-w-[1200px] px-5 pb-10 pt-10 md:px-6 md:pt-16">
      <BackLink href="/" label="Home" />
      <header className="flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between md:py-14">
        <div><p className="text-pixel text-[9px] text-primary">CHARACTER SHEET</p><h1 className="mt-5 text-[clamp(3rem,7vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.06em]">Curriculum Vitae</h1><p className="mt-4 text-muted-foreground">Experience, tools, and shipped work in one document.</p></div>
        <Link href={cvFile} target="_blank" rel="noreferrer" download className="pixel-button bg-primary text-primary-foreground">Download PDF <Download className="size-4" /></Link>
      </header>
      <div className="pixel-frame min-h-[78vh] overflow-hidden bg-card p-2 md:p-3"><object className="min-h-[78vh] w-full rounded-[4px]" data={cvFile} type="application/pdf"><div className="grid min-h-[78vh] place-items-center p-6 text-center"><p>Your browser cannot preview this PDF. <Link className="font-semibold text-primary" href={cvFile} target="_blank">Open it directly.</Link></p></div></object></div>
    </main>
  );
}
