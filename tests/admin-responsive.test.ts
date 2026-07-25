import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

test("admin shell swaps the fixed sidebar for mobile navigation below md", async () => {
  const shell = await readFile(path.resolve("src/app/admin/admin-shell.tsx"), "utf8");

  // Desktop sidebar is hidden on small screens.
  assert.match(shell, /hidden md:flex w-60 shrink-0/);

  // Mobile top header carries the brand and logout.
  assert.match(shell, /md:hidden fixed top-0/);
  assert.match(shell, /aria-label="Logout"/);

  // Mobile bottom tab bar is fixed, safe-area aware, and icon-only with labels for assistive tech.
  assert.match(shell, /md:hidden fixed bottom-0/);
  assert.match(shell, /safe-area-inset-bottom/);
  assert.match(shell, /aria-label=\{item\.label\}/);

  // Content clears the fixed mobile chrome, but is flush on desktop.
  assert.match(shell, /pt-14 pb-20 md:pt-0 md:pb-0/);

  // Every section stays reachable: 8 nav destinations in one shared list.
  const destinations = [...shell.matchAll(/href: "\/admin/g)];
  assert.equal(destinations.length, 8);
});

test("admin dashboard stats grid expands on wide screens", async () => {
  const page = await readFile(path.resolve("src/app/admin/(protected)/page.tsx"), "utf8");
  assert.match(page, /grid-cols-2 lg:grid-cols-4/);
});

test("admin list page headers wrap with breathing room on narrow screens", async () => {
  for (const file of ["apps/page.tsx", "certificates/page.tsx", "work-experience/page.tsx"]) {
    const source = await readFile(path.resolve("src/app/admin/(protected)", file), "utf8");
    assert.match(source, /flex flex-wrap items-center justify-between gap-3/, `${file} header cannot wrap`);
  }
});
