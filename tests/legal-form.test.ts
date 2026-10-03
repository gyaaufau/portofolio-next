import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

test("Markdown legal forms submit current text and keep edits after a save failure", async () => {
  const dom = new JSDOM("<div id='root'></div>", { url: "http://localhost" });
  const globals = {
    window: dom.window, self: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, Node: dom.window.Node,
    FormData: dom.window.FormData, MutationObserver: dom.window.MutationObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true,
    requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
  };
  const previous = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { AppRouterContext } = await import("next/dist/shared/lib/app-router-context.shared-runtime");
  const { AppForm } = await import("../src/app/admin/(protected)/apps/app-form");
  const router = { back() {}, forward() {}, refresh() {}, hmrRefresh() {}, push() {}, replace() {}, prefetch: async () => {} };
  const root = createRoot(dom.window.document.getElementById("root")!);
  let submitted: FormData | undefined;
  try {
    await React.act(async () => root.render(React.createElement(AppRouterContext.Provider, { value: router },
      React.createElement(AppForm, {
        submitLabel: "Update", initialData: { title: "Tilejoy", hasPrivacyPolicy: true, privacyPolicyContent: "## Original", hasAccountDeletion: true, accountDeletionContent: "## Delete" },
        action: async (form) => { submitted = form; throw new Error("Database unavailable"); },
      }),
    )));
    const policy = dom.window.document.querySelector<HTMLTextAreaElement>("textarea[name='privacyPolicyContent']")!;
    assert.ok(policy);
    assert.equal(policy.value, "## Original");
    const updated = "## Edited policy\n\n**Local only**\n\n- Photos\n\n[Contact](mailto:gyaaufau@gmail.com)";
    await React.act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value")!.set!.call(policy, updated);
      policy.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
    const form = dom.window.document.querySelector("form")!;
    assert.equal(new dom.window.FormData(form).get("privacyPolicyContent"), updated);
    assert.equal(new dom.window.FormData(form).get("accountDeletionContent"), "## Delete");
    await React.act(async () => { form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); });
    assert.equal(submitted?.get("privacyPolicyContent"), updated);
    assert.match(dom.window.document.body.textContent || "", /Database unavailable/);
    assert.equal(policy.value, updated);
  } finally {
    await React.act(async () => root.unmount());
    await new Promise((resolve) => setTimeout(resolve, 10));
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
