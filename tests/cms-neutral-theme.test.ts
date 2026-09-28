import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path: string) => readFileSync(new URL(path, root), "utf8");

test("CMS uses the neutral accent palette", () => {
  const css = source("src/app/admin/cms.css");

  assert.match(css, /--cms-accent:\s*#101114/);
  assert.match(css, /--cms-highlight:\s*#efede6/);
  assert.match(css, /--cms-highlight-text:\s*#8b8d94/);
  assert.doesNotMatch(css, /#f04b3a|#4059e8|#ffc857/i);
});

test("CMS and public site have no editable appearance surface", () => {
  assert.equal(existsSync(new URL("src/app/admin/(protected)/settings/appearance-form.tsx", root)), false);
  assert.equal(existsSync(new URL("src/app/admin/(protected)/appearance/page.tsx", root)), false);
  assert.equal(existsSync(new URL("src/app/admin/(protected)/appearance/loading.tsx", root)), false);

  const settings = source("src/app/admin/(protected)/settings/page.tsx");
  const layout = source("src/app/layout.tsx");
  assert.doesNotMatch(settings, /AppearanceForm|site_settings|accent_preset|accent_color|logo_src/);
  assert.doesNotMatch(layout, /getSiteSettings|logoSrc|--cta-color/);
});
