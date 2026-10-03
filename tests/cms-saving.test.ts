import assert from "node:assert/strict";
import test from "node:test";
import { appLegalFields } from "../src/lib/cms-app";
import { contentTab, normalizeContentRows } from "../src/lib/cms-content";

test("content defaults to Apps and preserves known tabs", () => {
  assert.equal(contentTab(undefined), "app");
  assert.equal(contentTab("unknown"), "app");
  assert.equal(contentTab("skills"), "skills");
  assert.equal(contentTab("note"), "note");
});

test("legacy non-blog drafts are unsaved changes, while notes remain drafts", () => {
  const draft = { id: "draft", kind: "app", entity_id: "garden", title: "Garden" };
  assert.equal(normalizeContentRows([], [draft], "app")[0].status, "unsaved");
  assert.equal(normalizeContentRows([], [{ ...draft, kind: "note" }], "note")[0].status, "draft");
});

test("older and non-mobile payloads preserve legal settings", () => {
  assert.deepEqual(appLegalFields({ title: "Garden" }), {});
  assert.deepEqual(appLegalFields({ appType: "web", legalFieldsPresent: "on", hasPrivacyPolicy: "off" }), {});
});

test("unchecked legal toggles disable pages without deleting their content", () => {
  assert.deepEqual(appLegalFields({ appType: "mobile", legalFieldsPresent: "on", privacyPolicyContent: "## Privacy", accountDeletionContent: "Contact us" }), {
    has_privacy_policy: false, privacy_policy_content: "## Privacy", has_account_deletion: false,
    account_deletion_content: "Contact us", account_deletion_requires_auth: false,
  });
});

test("enabled legal pages require meaningful content", () => {
  assert.throws(() => appLegalFields({ hasPrivacyPolicy: "on", privacyPolicyContent: "<p></p>" }), /Privacy Policy content/);
  assert.equal(appLegalFields({ hasPrivacyPolicy: "on", privacyPolicyContent: "<h2>Privacy</h2><p>Local only.</p>" }).privacy_policy_content, "## Privacy\n\nLocal only.");
});
