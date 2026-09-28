import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { getContact } from "@/data/db";

export const metadata: Metadata = { title: "CV | Argya Aulia Fauzandika", description: "Resume for Argya Aulia Fauzandika.", robots: "noindex, nofollow" };
export const dynamic = "force-dynamic";

export default async function CVPage() {
  const { cv: cvFile } = await getContact();
  return <main id="main-content" className="editorial-detail-page"><article className="editorial-cv"><Link href="/" className="editorial-back"><ArrowLeft size={16} /> Home</Link><header><span>CURRICULUM VITAE</span><h1>A record of work, learning, and craft.</h1><p>Experience, tools, and shipped work in one document.</p>{cvFile ? <Link href={cvFile} target="_blank" rel="noreferrer" download className="editorial-button editorial-button-dark">Download PDF <Download size={16} /></Link> : null}</header>{cvFile ? <object title="Curriculum Vitae" data={cvFile} type="application/pdf"><p>Your browser cannot preview this PDF. <Link href={cvFile} target="_blank">Open it directly.</Link></p></object> : <p className="editorial-empty">The CV will be available shortly.</p>}</article></main>;
}
