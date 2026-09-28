import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/markdown-article";
import { getNoteBySlug } from "@/data/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const note = await getNoteBySlug("how-to-build-scalable-flutter-app-architecture");
  return note ? { title: `${note.title} | Gialoop`, description: note.summary, openGraph: { type: "article", title: note.title, description: note.summary } } : { title: "Note not found | Gialoop" };
}

export default async function LegacyArchitectureNote() {
  const note = await getNoteBySlug("how-to-build-scalable-flutter-app-architecture");
  if (!note) notFound();
  return <main id="main-content" className="editorial-article"><Link href="/blog" className="editorial-back"><ArrowLeft size={16} /> All notes</Link><header><span>{note.tags.join(" · ")}</span><h1>{note.title}</h1><p>{note.summary}</p></header>{note.coverSrc && <div className="editorial-article-cover"><Image src={note.coverSrc} alt="" fill sizes="(min-width: 860px) 860px, 100vw" className="object-cover" /></div>}<MarkdownArticle body={note.body} /></main>;
}
