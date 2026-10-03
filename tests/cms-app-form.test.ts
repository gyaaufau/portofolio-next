import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

test("CMS legal controls preserve text across toggles, platform changes, and save failures", async () => {
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
  const { AppEditorForm } = await import("../src/app/admin/(protected)/content/apps/[id]/app-editor-form");
  const router = { back() {}, forward() {}, refresh() {}, hmrRefresh() {}, push() {}, replace() {}, prefetch: async () => {} };
  const root = createRoot(dom.window.document.getElementById("root")!);
  let submitted: FormData | undefined;
  try {
    await React.act(async () => root.render(React.createElement(AppRouterContext.Provider, { value: router },
      React.createElement(AppEditorForm, {
        isNew:true,
        initial: { platform:"mobile", privacy:true, deletion:true, requiresAuth:true,
          privacyHtml:React.createElement("p", null, "Original policy"), deletionHtml:React.createElement("p", null, "Delete your account") },
        action:async (form) => { submitted = form; return { error:"Database unavailable" }; },
      }, React.createElement("section", null,
          React.createElement("input", { name:"title", defaultValue:"Garden" }),
          React.createElement("select", { name:"appType", defaultValue:"mobile" },
            React.createElement("option", { value:"mobile" }, "Mobile"), React.createElement("option", { value:"web" }, "Web"))),
      ),
    )));
    await React.act(async () => { await new Promise((resolve) => setTimeout(resolve, 30)); });
    const form = dom.window.document.querySelector("form")!;
    const data = () => new dom.window.FormData(form);
    assert.match(String(data().get("privacyPolicyContent")), /Original policy/);
    const policyEditor = form.querySelector<HTMLElement>('[contenteditable][aria-label="Privacy Policy content"]')!;
    await React.act(async () => {
      policyEditor.innerHTML = "<p>Edited policy</p>";
      policyEditor.dispatchEvent(new dom.window.Event("input", { bubbles:true }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    assert.match(String(data().get("privacyPolicyContent")), /Edited policy/);
    const title = form.querySelector<HTMLInputElement>('input[name="title"]')!;
    title.value = "Edited title";
    const privacy = form.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    await React.act(async () => privacy.click());
    assert.equal(data().get("hasPrivacyPolicy"), "off");
    assert.match(String(data().get("privacyPolicyContent")), /Edited policy/);
    await React.act(async () => privacy.click());
    assert.equal(data().get("hasPrivacyPolicy"), "on");
    const platform = form.querySelector<HTMLSelectElement>('select[name="appType"]')!;
    await React.act(async () => {
      platform.value = "web";
      platform.dispatchEvent(new dom.window.Event("change", { bubbles:true }));
    });
    assert.equal(form.querySelector<HTMLElement>("#app-legal")!.hidden, true);
    await React.act(async () => {
      platform.value = "mobile";
      platform.dispatchEvent(new dom.window.Event("change", { bubbles:true }));
    });
    assert.equal(form.querySelector<HTMLElement>("#app-legal")!.hidden, false);
    assert.match(String(data().get("privacyPolicyContent")), /Edited policy/);
    await React.act(async () => { form.dispatchEvent(new dom.window.Event("submit", { bubbles:true, cancelable:true })); });
    assert.equal(submitted?.get("title"), "Edited title");
    assert.match(String(submitted?.get("privacyPolicyContent")), /Edited policy/);
    assert.equal(submitted?.get("accountDeletionRequiresAuth"), "on");
    assert.match(dom.window.document.body.textContent || "", /Database unavailable/);
    assert.equal(title.value, "Edited title");
    assert.match(String(data().get("privacyPolicyContent")), /Edited policy/);
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
