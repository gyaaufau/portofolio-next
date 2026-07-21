import "dotenv/config";
import { readdirSync } from "fs";
import { join, posix } from "path";
import { createR2Client, uploadToR2, listR2Keys, isR2Configured } from "../src/lib/r2";

const PUBLIC_DIR = join(__dirname, "..", "public");
const DATA_DIR = join(PUBLIC_DIR, "data");
const SKIP_EXTENSIONS = new Set([".md"]);

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

async function main() {
  if (!isR2Configured()) {
    console.error("R2 environment variables not set. Check .env");
    process.exit(1);
  }

  const client = createR2Client();
  const existingKeys = await listR2Keys(client);
  const allFiles = walkFiles(DATA_DIR);

  const filesToUpload = allFiles.filter((f) => {
    const ext = posix.extname(f).toLowerCase();
    if (SKIP_EXTENSIONS.has(ext)) return false;
    const key = f.replace(PUBLIC_DIR + "/", "").replace(/\\/g, "/");
    return !existingKeys.has(key);
  });

  console.log(`Found ${allFiles.length} files, ${filesToUpload.length} to upload (skipping .md, already-uploaded).`);

  let uploaded = 0;
  let failed = 0;

  for (const filePath of filesToUpload) {
    const key = filePath.replace(PUBLIC_DIR + "/", "").replace(/\\/g, "/");
    try {
      await uploadToR2(filePath, key, client);
      uploaded++;
      console.log(`  ✓ ${key}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${key}: ${err}`);
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Failed: ${failed}, Skipped (existing): ${existingKeys.size}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
