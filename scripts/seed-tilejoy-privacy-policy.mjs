import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase URL and service role key are required.");
const content = await readFile(new URL("./data/tilejoy-privacy-policy.md", import.meta.url), "utf8");
assert.equal((content.match(/^## /gm) || []).length, 9);
assert.ok(content.includes("Tilejoy: Piece by piece") && content.includes("gyaaufau@gmail.com"));

const endpoint = `${url}/rest/v1/app?id=eq.tilejoy&slug=eq.tilejoy&select=*`;
const headers = { apikey: key, Authorization: `Bearer ${key}` };
async function readApp() {
  const response = await fetch(endpoint, { headers });
  if (!response.ok) throw new Error(`Unable to read Tilejoy (${response.status}).`);
  const rows = await response.json();
  assert.equal(rows.length, 1, "Expected exactly one existing Tilejoy app.");
  return rows[0];
}
const before = await readApp();
const response = await fetch(endpoint, {
  method: "PATCH",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ privacy_policy_content: content, has_privacy_policy: true }),
});
if (!response.ok) throw new Error(`Unable to seed Tilejoy (${response.status}).`);
const after = await readApp();
assert.equal(after.privacy_policy_content, content);
assert.equal(after.has_privacy_policy, true);
for (const field of Object.keys(before)) {
  if (!["privacy_policy_content", "has_privacy_policy", "updated_at"].includes(field)) {
    assert.deepEqual(after[field], before[field], `Unexpected change to ${field}.`);
  }
}
console.log(`Tilejoy policy seeded and verified: ${content.length} characters, 9 sections; other app fields preserved.`);
