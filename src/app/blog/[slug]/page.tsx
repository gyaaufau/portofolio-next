import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { MarkdownArticle } from "@/components/markdown-article";
import { getNoteBySlug } from "@/data/db";
import { absoluteUrl } from "@/data/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await getNoteBySlug((await params).slug);
  return note ? { title: `${note.title} | Gialoop`, description: note.summary, openGraph: { type: "article", title: note.title, description: note.summary, url: absoluteUrl(`/blog/${note.slug}`), images: note.coverSrc ? [{ url: note.coverSrc }] : undefined } } : { title: "Note not found | Gialoop" };
}

export default async function NotePage({ params }: Props) {
  const note = await getNoteBySlug((await params).slug);
  if (!note) notFound();
  return <main id="main-content" className="editorial-article"><Link href="/blog" className="editorial-back"><ArrowLeft size={16} /> All notes</Link><header><span>{note.tags.join(" · ")}</span><h1>{note.title}</h1><p>{note.summary}</p>{note.publishedAt && <time dateTime={note.publishedAt}>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(note.publishedAt))}</time>}</header>{note.coverSrc && <div className="editorial-article-cover"><Image src={note.coverSrc} alt="" fill sizes="(min-width: 860px) 860px, 100vw" className="object-cover" /></div>}<MarkdownArticle body={note.body} /></main>;
}
