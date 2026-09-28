import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getNotes } from "@/data/db";

export const metadata: Metadata = { title: "Notes | Gialoop", description: "Published engineering and product notes from Gialoop." };
export const dynamic = "force-dynamic";
export default async function BlogPage() {
  const notes = await getNotes();
  return <main id="main-content" className="editorial-list-page"><header><span>NOTES</span><h1>Thinking out loud.</h1><p>Published notes on mobile engineering, product craft, and practical delivery.</p></header>{notes.length ? <div className="editorial-note-grid">{notes.map((note) => <Link href={`/blog/${note.slug}`} key={note.id}><div>{note.coverSrc && <Image src={note.coverSrc} alt="" fill sizes="(min-width: 900px) 33vw, 100vw" className="object-cover" />}</div><small>{note.tags.join(" · ")}</small><h2>{note.title}</h2><p>{note.summary}</p><span>Read note <ArrowUpRight size={16} /></span></Link>)}</div> : <p className="editorial-empty">No notes have been published yet.</p>}</main>;
}
