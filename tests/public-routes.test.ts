import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const databaseBackedPublicPages = [
  "../src/app/page.tsx",
  "../src/app/apps/page.tsx",
  "../src/app/apps/[slug]/page.tsx",
  "../src/app/certificates/page.tsx",
  "../src/app/certificates/[slug]/page.tsx",
];

test("database-backed public pages render at request time", () => {
  for (const path of databaseBackedPublicPages) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");

    assert.match(source, /export const dynamic = ["']force-dynamic["'];/);
    assert.doesNotMatch(source, /export const revalidate\s*=/);
  }
});
