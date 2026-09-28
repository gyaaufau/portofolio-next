import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path: string) => readFileSync(new URL(path, root), "utf8");

test("section controls expose a labeled visibility switch and keyboard reorder actions", () => {
  const editor = source("src/app/admin/(protected)/sections/sections-editor.tsx");

  assert.match(editor, /role="switch"/);
  assert.match(editor, /item\.visible \? "Visible" : "Hidden"/);
  assert.match(editor, /Move \$\{item\.label\} up/);
  assert.match(editor, /Move \$\{item\.label\} down/);
});

test("section changes save the current visibility and visual order as drafts", () => {
  const editor = source("src/app/admin/(protected)/sections/sections-editor.tsx");
  const actions = source("src/app/admin/cms-actions.ts");

  assert.match(editor, /name="sections" value=\{JSON\.stringify\(items\)\}/);
  assert.match(actions, /sortOrder: String\(index\), visible: section\.visible \? "on" : ""/);
  assert.match(actions, /sort_order: Number\(p\.sortOrder \|\| 0\)/);
});
