const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const PREFIXES = ["01_shou", "02_otolog", "03_litbang_au_app", "04_ditonton"];

async function listFiles(prefix: string): Promise<string[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/apps`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: "name", order: "asc" } }),
  });
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const files: string[] = [];
  for (const item of data) {
    const fullPath = `${prefix}/${item.name}`;
    if (item.id && item.id !== "null") {
      files.push(fullPath);
    } else {
      const sub = await listFiles(fullPath);
      files.push(...sub);
    }
  }
  return files;
}

async function deleteFile(key: string) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/apps/${key}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`  ✗ ${key}: ${err}`);
  }
}

async function main() {
  for (const prefix of PREFIXES) {
    console.log(`Cleaning ${prefix}/...`);
    const files = await listFiles(prefix);
    for (const f of files) {
      await deleteFile(f);
      console.log(`  ✓ deleted ${f}`);
    }
  }
  console.log("Done.");
}

main();
