import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createSessionToken, passwordMatches, verifySessionToken } from "../src/lib/auth";

const secret = "test-session-secret-with-at-least-32-characters";

test("accepts a valid signed admin session", async () => {
  const token = await createSessionToken(secret);
  assert.equal(await verifySessionToken(token, secret), true);
});

test("rejects missing, tampered, and expired sessions", async () => {
  const token = await createSessionToken(secret);
  assert.equal(await verifySessionToken(undefined, secret), false);
  assert.equal(await verifySessionToken(`${token}tampered`, secret), false);
  const expired = await createSessionToken(secret, -1);
  assert.equal(await verifySessionToken(expired, secret), false);
});

test("requires a strong configured session secret", async () => {
  await assert.rejects(() => createSessionToken("too-short"), /at least 32 characters/);
});

test("compares the configured admin password", () => {
  assert.equal(passwordMatches("cozy-pass", "cozy-pass"), true);
  assert.equal(passwordMatches("wrong", "cozy-pass"), false);
  assert.throws(() => passwordMatches("anything", ""), /ADMIN_PASSWORD/);
});

test("authorizes every mutating server action before database access", () => {
  const actions = readFileSync(new URL("../src/app/admin/actions.ts", import.meta.url), "utf8");
  const mutations = [
    "createApp", "updateApp", "deleteApp", "toggleAppFeatured",
    "createCertificate", "updateCertificate", "deleteCertificate",
    "createWorkExperience", "updateWorkExperience", "deleteWorkExperience",
    "updateProfile", "updateContact", "updateSkillCategory", "updateSiteSettings",
  ];

  for (const name of mutations) {
    const start = actions.indexOf(`export async function ${name}`);
    assert.notEqual(start, -1, `${name} must remain exported`);
    const nextExport = actions.indexOf("export async function ", start + 1);
    const body = actions.slice(start, nextExport === -1 ? undefined : nextExport);
    const guard = body.indexOf("await requireAdmin();");
    const databaseAccess = body.indexOf("prisma.");
    assert.ok(guard !== -1, `${name} must require an admin session`);
    assert.ok(databaseAccess === -1 || guard < databaseAccess, `${name} must authorize before touching Prisma`);
  }
});
