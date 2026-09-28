import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CertificateItem } from "@/data/types";

export function CertificateDetailView({ certificate }: { certificate: CertificateItem }) {
  return <article className="editorial-certificate"><Link href="/certificates" className="editorial-back"><ArrowLeft size={16} /> All certificates</Link><header><span>{certificate.type} · {certificate.issued}</span><h1>{certificate.title}</h1><p>{certificate.issuer}</p><p>{certificate.summary}</p></header>{certificate.image ? <div className="editorial-certificate-image"><Image src={certificate.image.src} alt={certificate.image.alt} width={certificate.image.width} height={certificate.image.height} priority /></div> : null}<div className="editorial-certificate-grid"><section><span>ISSUER</span><h2>About the issuer</h2>{certificate.issuerNotes.map((note) => <p key={note}>{note}</p>)}</section><section><span>LEARNING</span><h2>What it represents</h2>{certificate.details.map((detail) => <p key={detail}>{detail}</p>)}</section></div><section className="editorial-certificate-relevance"><span>RELEVANCE</span><h2>Why it matters</h2><p>{certificate.relevance}</p></section></article>;
}
