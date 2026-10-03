import assert from "node:assert/strict";
import test from "node:test";
import { appSupportFields } from "../src/lib/cms-app";

test("older app payloads preserve existing support settings", () => {
  assert.deepEqual(appSupportFields({ title: "Garden" }), {});
});

test("blank support email defaults and rich text becomes Markdown on all platforms", () => {
  for (const appType of ["mobile", "web", "desktop", "backend"]) {
    assert.deepEqual(appSupportFields({ appType, supportEmail: "  ", supportContent: "<h2>Help</h2><p>Contact us</p>" }), {
      support_email: "gyaaufau@gmail.com", support_content: "## Help\n\nContact us",
    });
  }
});

test("support email is trimmed, content can be cleared, and invalid email is rejected", () => {
  assert.deepEqual(appSupportFields({ supportEmail: "  help@example.com  ", supportContent: "" }), {
    support_email: "help@example.com", support_content: "",
  });
  for (const email of ["invalid", "a@", "a b@example.com", "a@example.com\r\nBcc:other@example.com"]) {
    assert.throws(() => appSupportFields({ supportEmail: email }), /valid support email/);
  }
});
