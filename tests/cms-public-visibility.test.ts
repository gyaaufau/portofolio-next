import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public portfolio queries exclude rows marked as drafts", async () => {
  const source = await readFile("src/data/db.ts", "utf8");
  for (const name of ["getApps", "getFeaturedApps", "getAppBySlug", "getCertificates", "getFeaturedCertificates", "getCertificateBySlug", "getWorkExperiences"]) {
    const start = source.indexOf(`export const ${name}`);
    const next = source.indexOf("export const ", start + 1);
    const end = next < 0 ? source.length : next;
    assert.ok(start >= 0, `${name} exists`);
    assert.match(source.slice(start, end), /\.eq\("publication_status", "published"\)/, `${name} must filter drafts`);
  }
});

test("public visitors can read CMS section visibility", async () => {
  const migration = await readFile("supabase/migrations/20260927091000_cms_section_public_read.sql", "utf8");

  assert.match(migration, /ALTER TABLE public\.cms_section ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /GRANT SELECT ON TABLE public\.cms_section TO anon, authenticated/);
  assert.match(migration, /CREATE POLICY cms_section_read_public/);
  assert.match(migration, /USING \(true\)/);
});
