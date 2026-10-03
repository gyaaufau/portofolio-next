import assert from "node:assert/strict";
import test from "node:test";
import { validateLegalContent } from "../src/lib/legal-content";

test("enabled legal pages reject empty editor HTML", () => {
  for (const html of ["", "<p></p>", "<p><br></p>", "<p> &nbsp; &#160; &#xA0; </p>"]) {
    assert.throws(() => validateLegalContent({ hasPrivacyPolicy: "on", privacyPolicyContent: html }), /Privacy Policy content is required/);
    assert.throws(() => validateLegalContent({ hasAccountDeletion: "on", accountDeletionContent: html }), /Account Deletion content is required/);
  }
});

test("disabled pages allow empty content and enabled pages allow formatted text", () => {
  assert.doesNotThrow(() => validateLegalContent({}));
  assert.doesNotThrow(() => validateLegalContent({ hasPrivacyPolicy: "on", privacyPolicyContent: "<h2>Policy</h2><p>Local storage.</p>" }));
});
