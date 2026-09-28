import assert from "node:assert/strict";
import test from "node:test";
import { publishDraftBatch } from "../src/lib/cms-publish";

test("batch publishing removes only successfully published drafts", async () => {
  const removed: string[] = [];
  const result = await publishDraftBatch(["ready","invalid","another"], async (draft) => {
    if (draft === "invalid") throw new Error("Missing body");
  }, async (draft) => { removed.push(draft); });
  assert.deepEqual(removed, ["ready","another"]);
  assert.equal(result.succeeded, 2);
  assert.deepEqual(result.failed, [{ id:"invalid", message:"Missing body" }]);
});

test("a failed removal counts as a failed publish and remains visible for retry", async () => {
  const result = await publishDraftBatch(["ready"], async () => {}, async () => { throw new Error("Remove failed"); });
  assert.equal(result.succeeded, 0);
  assert.deepEqual(result.failed, [{ id:"ready", message:"Remove failed" }]);
});
