import { readdirSync, readFileSync } from "fs";
import { join, extname } from "path";

const SKIP_EXTENSIONS = new Set([".md"]);
const PUBLIC_DIR = join(__dirname, "..", "public");
const DATA_DIR = join(PUBLIC_DIR, "data");

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

function guessMime(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_MAP[ext] || "application/octet-stream";
}

function walkFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function getBucketAndKey(filePath: string): { bucket: string; key: string } | null {
  const relative = filePath.replace(DATA_DIR + "/", "").replace(/\\/g, "/");

  // data/project/<name>/... → apps bucket, key = <slug>/...
  const projectMatch = relative.match(/^project\/([^/]+)\/(.+)$/);
  if (projectMatch) {
    // Strip numeric prefix (01_, 02_, etc.) and convert underscores to hyphens
    const slug = projectMatch[1].replace(/^\d+_/, "").replace(/_/g, "-");
    return { bucket: "apps", key: `${slug}/${projectMatch[2]}` };
  }

  return { bucket: "portfolio", key: `data/${relative}` };
}

async function listBucketKeys(bucket: string): Promise<Set<string>> {
  const keys = new Set<string>();
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/${bucket}`;

  async function listFolder(prefix: string) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: "name", order: "asc" } }),
    });
    const data = await res.json();
    if (!Array.isArray(data)) return;
    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id && item.id !== "null") {
        keys.add(fullPath);
      } else {
        await listFolder(fullPath);
      }
    }
  }

  await listFolder("");
  return keys;
}

async function uploadFile(bucket: string, key: string, filePath: string): Promise<void> {
  const body = readFileSync(filePath);
  const contentType = guessMime(filePath);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${key}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
}

async function main() {
  const allFiles = walkFiles(DATA_DIR);
  const uploadable = allFiles.filter((f) => {
    const ext = extname(f).toLowerCase();
    return !SKIP_EXTENSIONS.has(ext);
  });

  console.log(`Found ${allFiles.length} files, ${uploadable.length} to upload (skipping .md)\n`);

  console.log("Listing existing files in buckets...");
  const portfolioKeys = await listBucketKeys("portfolio");
  const appsKeys = await listBucketKeys("apps");
  console.log(`  portfolio: ${portfolioKeys.size} existing files`);
  console.log(`  apps: ${appsKeys.size} existing files\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of uploadable) {
    const mapping = getBucketAndKey(filePath);
    if (!mapping) continue;

    const { bucket, key } = mapping;
    const existingKeys = bucket === "apps" ? appsKeys : portfolioKeys;

    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }

    try {
      await uploadFile(bucket, key, filePath);
      uploaded++;
      const size = readFileSync(filePath).length;
      console.log(`  ✓ ${bucket}/${key} (${(size / 1024).toFixed(0)}KB)`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${bucket}/${key}: ${err}`);
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
