import assert from "node:assert/strict";
import test from "node:test";
import { validateMediaUpload } from "../src/lib/cms-media";

test("media upload accepts supported images up to 10 MB", () => {
  assert.equal(validateMediaUpload("image/png", 10 * 1024 * 1024), null);
  assert.equal(validateMediaUpload("image/webp", 64), null);
});

test("media upload rejects unsupported files and oversized images", () => {
  assert.match(validateMediaUpload("application/pdf", 100) || "", /PNG/);
  assert.match(validateMediaUpload("image/jpeg", 10 * 1024 * 1024 + 1) || "", /10 MB/);
});
