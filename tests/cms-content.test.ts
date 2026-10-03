import assert from "node:assert/strict";
import test from "node:test";
import { contentStatus, draftEntityId, normalizeContentRows, slugify } from "../src/lib/cms-content";

test("draft edits remain separate from published entries in the library", () => {
  const rows = normalizeContentRows(
    [{ id: "garden", title: "Focus Garden", updated_at: "2026-09-01", publication_status: "published" }],
    [{ id: "draft-1", kind: "app", entity_id: "garden", title: "Focus Garden refresh", updated_at: "2026-09-02" }],
    "app",
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, "Focus Garden refresh");
  assert.equal(rows[0].status, "unsaved");
  assert.equal(rows[0].href, "/admin/content/apps/garden");
});

test("new draft entries get a stable draft identity", () => {
  assert.equal(draftEntityId("The calm power of a well-timed haptic"), "the-calm-power-of-a-well-timed-haptic");
  assert.equal(slugify("  A / B & C  "), "a-b-c");
  assert.equal(contentStatus({ publication_status: "draft" }), "draft");
  assert.equal(contentStatus({ publication_status: "published" }), "published");
});
