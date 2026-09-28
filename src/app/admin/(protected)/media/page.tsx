import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { MediaUploader } from "./media-uploader";

type Asset = { key: string; name: string; url: string; size: number; bucket: string; created: string };
async function listBucket(bucket: "apps" | "portfolio", path = "", depth = 0): Promise<Asset[]> {
  if (depth > 4) return [];
  const db = createAdminClient();
  const entries: Array<{ id?: string | null; name: string; metadata?: Record<string, unknown> | null; created_at?: string | null }> = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await db.storage.from(bucket).list(path, { limit:100, offset, sortBy:{ column:"created_at", order:"desc" } });
    if (error) throw new Error(error.message);
    entries.push(...(data ?? []));
    if (!data || data.length < 100) break;
  }
  const nested = await Promise.all(entries.map(async (entry) => {
    const key = path ? `${path}/${entry.name}` : entry.name;
    if (!entry.id) return listBucket(bucket,key,depth+1);
    if (!/\.(png|jpe?g|webp)$/i.test(entry.name)) return [];
    return [{ key, name:entry.name, url:db.storage.from(bucket).getPublicUrl(key).data.publicUrl, size:Number(entry.metadata?.size || 0), bucket, created:entry.created_at || "" }];
  }));
  return nested.flat();
}

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const db = createAdminClient();
  const [apps, portfolio, appRows, notes, certificates, profile] = await Promise.all([
    listBucket("apps"), listBucket("portfolio"),
    db.from("app").select("app_icon_src,thumbnail_src,app_screenshot(src)"),
    db.from("cms_note").select("cover_src"),
    db.from("certificate").select("image_src"),
    db.from("profile").select("photo_src"),
  ]);
  const used = new Set<string>();
  for (const row of appRows.data ?? []) { if (row.app_icon_src) used.add(row.app_icon_src); if (row.thumbnail_src) used.add(row.thumbnail_src); for (const shot of row.app_screenshot ?? []) used.add(shot.src); }
  for (const row of notes.data ?? []) if (row.cover_src) used.add(row.cover_src);
  for (const row of certificates.data ?? []) if (row.image_src) used.add(row.image_src);
  for (const row of profile.data ?? []) if (row.photo_src) used.add(row.photo_src);
  const all = [...apps,...portfolio].sort((a,b) => b.created.localeCompare(a.created));
  const visible = filter === "unused" ? all.filter((asset) => !used.has(asset.url)) : all;
  const bytes = all.reduce((sum,asset) => sum + asset.size,0);
  return <div><div className="cms-page-head"><div><div className="cms-eyebrow">Media</div><h1>Assets, ready to ship.</h1><p>Every image in the portfolio storage library.</p></div><MediaUploader /></div><section className="cms-card"><div className="cms-card-heading"><span className="cms-mono">Media library · {all.length} files · {(bytes / 1024 / 1024).toFixed(1)} MB</span></div><div className="cms-pills cms-media-filters"><Link href="/admin/media" className={`cms-pill${filter ? "" : " is-active"}`}>All</Link><Link href="/admin/media?filter=unused" className={`cms-pill${filter === "unused" ? " is-active" : ""}`}>Unused</Link></div><div className="cms-media-grid">{visible.map((asset) => <div className="cms-media-item" key={`${asset.bucket}/${asset.key}`}><div className="cms-media-thumb"><Image src={asset.url} alt="" fill sizes="(max-width: 767px) 45vw, 23vw" unoptimized /></div><strong title={asset.name}>{asset.name}</strong><span className="cms-mono">{(asset.size / 1024 / 1024).toFixed(1)} MB · {asset.bucket}</span><a href={asset.url} target="_blank" rel="noopener noreferrer">Open image ↗</a></div>)}{!visible.length && <div className="cms-empty-state"><strong>{filter === "unused" ? "No unused images." : "No assets yet."}</strong><p>Upload an image to add it to the library.</p></div>}</div></section></div>;
}
