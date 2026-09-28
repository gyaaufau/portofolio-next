import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type SeedNote = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  bodyFile: string;
  coverFile: string;
  publishedAt: string;
};

const notes: SeedNote[] = [
  {
    id: "offline-first-state-in-flutter",
    slug: "offline-first-state-in-flutter",
    title: "Offline-First State in Flutter: A Practical Sync Model",
    summary: "Use local data as the screen’s source of truth, then make refresh, queued writes, retries, and conflicts explicit.",
    tags: ["Flutter", "Offline-First", "Architecture"],
    bodyFile: "offline-first-state.md",
    coverFile: "offline-first-flutter.png",
    publishedAt: "2026-09-20T09:00:00Z",
  },
  {
    id: "profiling-mobile-app-performance",
    slug: "profiling-mobile-app-performance",
    title: "Profiling Mobile App Performance Without Guesswork",
    summary: "A repeatable way to investigate startup delays, dropped frames, images, and list performance in Flutter apps.",
    tags: ["Flutter", "Performance", "Mobile Engineering"],
    bodyFile: "mobile-performance-profiling.md",
    coverFile: "mobile-performance-profiling.png",
    publishedAt: "2026-09-24T09:00:00Z",
  },
  {
    id: "resilient-mobile-api-clients",
    slug: "resilient-mobile-api-clients",
    title: "Building Resilient API Clients for Mobile Apps",
    summary: "Handle timeouts, retries, cancellation, duplicate writes, and malformed responses at a clear data boundary.",
    tags: ["Mobile Engineering", "API Design", "Reliability"],
    bodyFile: "resilient-mobile-api-clients.md",
    coverFile: "resilient-api-clients.png",
    publishedAt: "2026-09-27T09:00:00Z",
  },
];

const seedDir = path.join(process.cwd(), "scripts", "seeds", "engineering-notes");
const coverDir = path.join(process.cwd(), "public", "assets", "notes");
const bucket = "portfolio";

let apiBase = "";
let serviceRoleKey = "";

async function request(pathname: string, init: RequestInit = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${response.status} ${detail}`);
  }
  return response;
}

async function getRows<T>(table: string, filters: Record<string, string>): Promise<T[]> {
  const query = new URLSearchParams({ select: "id,slug", ...filters });
  return request(`/rest/v1/${table}?${query}`).then((response) => response.json() as Promise<T[]>);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the project environment.");
  }
  apiBase = supabaseUrl.replace(/\/$/, "");

  try {
    await request("/rest/v1/cms_note?select=id%2Cslug%2Cpublished_at%2Ccover_src&limit=1");
  } catch (error) {
    throw new Error(`CMS notes schema is unavailable. Apply the CMS migrations first: ${error instanceof Error ? error.message : "schema check failed"}`);
  }

  const folderResponse = await request(`/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: "notes", limit: 1000 }),
  });
  const folder = await folderResponse.json() as Array<{ name: string }>;
  const existingFiles = new Set(folder.map((file) => file.name));

  let inserted = 0;
  let skipped = 0;
  for (const note of notes) {
    const [byId, bySlug] = await Promise.all([
      getRows<{ id: string; slug: string }>("cms_note", { id: `eq.${note.id}`, limit: "1" }),
      getRows<{ id: string; slug: string }>("cms_note", { slug: `eq.${note.slug}`, limit: "1" }),
    ]);
    if (byId.length || bySlug.length) {
      console.log(`Skipped existing note: ${note.slug}`);
      skipped += 1;
      continue;
    }

    const body = (await readFile(path.join(seedDir, note.bodyFile), "utf8")).trim();
    if (body.length < 500) throw new Error(`Article body is unexpectedly short: ${note.bodyFile}`);
    const storagePath = `notes/${note.coverFile}`;
    const cover = await readFile(path.join(coverDir, note.coverFile));
    if (!existingFiles.has(note.coverFile)) {
      await request(`/storage/v1/object/${bucket}/${storagePath.split("/").map(encodeURIComponent).join("/")}`, {
        method: "POST",
        headers: { "Content-Type": "image/png", "x-upsert": "false" },
        body: cover,
      });
      existingFiles.add(note.coverFile);
    }

    const coverSrc = `${apiBase}/storage/v1/object/public/${bucket}/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
    await request("/rest/v1/cms_media?on_conflict=bucket%2Cstorage_path", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({
      bucket,
      storage_path: storagePath,
      public_url: coverSrc,
      file_name: note.coverFile,
      mime_type: "image/png",
      size_bytes: cover.byteLength,
      }),
    });

    const result = await request("/rest/v1/cms_note", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
      id: note.id,
      slug: note.slug,
      title: note.title,
      summary: note.summary,
      body,
      tags: note.tags,
      cover_src: coverSrc,
      publication_status: "published",
      published_at: note.publishedAt,
      }),
    }).catch((error: unknown) => {
      if (error instanceof Error && error.message.startsWith("409 ")) {
        return null;
      }
      throw error;
    });
    if (!result) {
        console.log(`Skipped note after a concurrent ID or slug insert: ${note.slug}`);
        skipped += 1;
        continue;
    }
    console.log(`Published note: ${note.slug}`);
    inserted += 1;
  }

  console.log(`Seed complete. Published ${inserted}; skipped ${skipped}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Note seed failed.");
  process.exitCode = 1;
});
