import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";
import { lookup } from "node:dns/promises";

async function getIpv4(host: string): Promise<string> {
  const results = await lookup(host, { family: 4 });
  return results.address;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx scripts/run-sql.ts <file.sql>");
    process.exit(1);
  }

  const filePath = join(__dirname, "..", args[0]);
  const sql = readFileSync(filePath, "utf-8");

  console.log(`Executing ${args[0]}...`);

  const ipv4 = await getIpv4("db.pkzdlrxgfwlklomdwgfz.supabase.co");
  console.log(`  Connecting to ${ipv4}...`);

  const sqlClient = postgres({
    host: ipv4,
    port: 5432,
    database: "postgres",
    username: "postgres",
    password: "YXYuY28BcJrFtS4C",
    max: 1,
    connect_timeout: 15,
  });

  try {
    await sqlClient.unsafe(sql);
    console.log("  ✓ Done");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("already exists")) {
      console.log("  ✓ Done (tables already exist)");
    } else {
      console.error(`  ✗ ${message}`);
    }
  } finally {
    await sqlClient.end();
  }
}

main();
