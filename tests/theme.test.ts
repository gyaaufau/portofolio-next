import assert from "node:assert/strict";
import test from "node:test";
import { normalizeHexColor, readableForeground, resolveAccent } from "../src/lib/theme";

test("normalizes valid custom accents", () => {
  assert.equal(normalizeHexColor("#4f7a68"), "#4F7A68");
  assert.equal(normalizeHexColor("4f7a68"), null);
  assert.equal(normalizeHexColor("#xyzxyz"), null);
});

test("resolves curated presets and custom colors", () => {
  assert.deepEqual(resolveAccent("moss", "#000000"), { preset: "moss", color: "#4F7A68" });
  assert.deepEqual(resolveAccent("custom", "#abcdef"), { preset: "custom", color: "#ABCDEF" });
  assert.ok("error" in resolveAccent("custom", "not-a-color"));
  assert.ok("error" in resolveAccent("unknown", "#123456"));
});

test("selects a readable foreground for light and dark accents", () => {
  assert.equal(readableForeground("#F2D15D"), "#17201D");
  assert.equal(readableForeground("#315B4B"), "#FDFCF9");
});
