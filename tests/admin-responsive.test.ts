import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

test("CMS navigation remains reachable on desktop and phone", async () => {
  const shell = await readFile(path.resolve("src/app/admin/admin-shell.tsx"), "utf8");
  const styles = await readFile(path.resolve("src/app/admin/cms.css"), "utf8");

  assert.match(shell, /className="cms-sidebar"/);
  assert.match(shell, /className="cms-mobile-bar"/);
  assert.match(shell, /className="cms-bottom-nav"/);
  assert.match(shell, /className="cms-drawer"/);
  assert.match(shell, /aria-label="Open navigation"/);
  assert.match(shell, /aria-label="Logout"/);
  assert.match(shell, /aria-label=\{item\.label\}/);
  assert.match(styles, /\.cms-sidebar,\.cms-desktop-bar\{display:none\}/);
  assert.match(styles, /safe-area-inset-bottom/);
  const destinations = [...shell.matchAll(/href: "\/admin/g)];
  assert.equal(destinations.length, 5);
});

test("CMS dashboard stats fit phone and desktop widths", async () => {
  const styles = await readFile(path.resolve("src/app/admin/cms.css"), "utf8");
  assert.match(styles, /\.cms-stats\{[^}]*repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.cms-stats\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test("admin list page headers wrap with breathing room on narrow screens", async () => {
  for (const file of ["apps/page.tsx", "certificates/page.tsx", "work-experience/page.tsx"]) {
    const source = await readFile(path.resolve("src/app/admin/(protected)", file), "utf8");
    assert.match(source, /flex flex-wrap items-center justify-between gap-3/, `${file} header cannot wrap`);
  }
});
