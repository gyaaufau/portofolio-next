"use client";

import Link from "next/link";
import { DEFAULT_SUPPORT_EMAIL } from "@/lib/support";
import type { CmsSaveAction } from "@/lib/cms-content";
import { useState } from "react";
import { CmsSaveForm, CmsSubmitButton } from "@/components/cms-save-form";
import { RichTextEditor } from "@/components/rich-text-editor";

export function AppEditorForm({ children, action, isNew, initial }: {
  children?: React.ReactNode;
  action: CmsSaveAction;
  isNew: boolean;
  initial: { platform: string; privacy: boolean; deletion: boolean; requiresAuth: boolean; privacyHtml: React.ReactNode; deletionHtml: React.ReactNode; supportEmail?: string; supportHtml?: React.ReactNode };
}) {
  const [platform, setPlatform] = useState(initial.platform);
  const [privacy, setPrivacy] = useState(initial.privacy);
  const [deletion, setDeletion] = useState(initial.deletion);
  const [requiresAuth, setRequiresAuth] = useState(initial.requiresAuth);
  return <CmsSaveForm action={action} successHref="/admin/content?type=app" className="cms-editor-grid" onChange={(event) => {
    const target = event.target as HTMLInputElement;
    if (target.name === "appType") setPlatform(target.value);
  }}>
    <div className="cms-editor-main">{children}
      <section id="app-legal" className="cms-card" hidden={platform !== "mobile"}>
        <span className="cms-mono">05 · Legal pages</span>
        <p className="cms-help">Optional public pages for your mobile app. Turning a page off keeps its content.</p>
        <input type="hidden" name="legalFieldsPresent" value={platform === "mobile" ? "on" : "off"} />
        <input type="hidden" name="hasPrivacyPolicy" value={privacy ? "on" : "off"} />
        <input type="hidden" name="hasAccountDeletion" value={deletion ? "on" : "off"} />
        <input type="hidden" name="accountDeletionRequiresAuth" value={requiresAuth ? "on" : "off"} />
        <label className="cms-check"><input type="checkbox" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} /> Enable Privacy Policy page</label>
        <div className="cms-legal-editor" hidden={!privacy}><RichTextEditor name="privacyPolicyContent" label="Privacy Policy content" initialContent={initial.privacyHtml} /></div>
        <label className="cms-check"><input type="checkbox" checked={deletion} onChange={(event) => setDeletion(event.target.checked)} /> Enable Account Deletion page</label>
        <div className="cms-legal-editor" hidden={!deletion}><RichTextEditor name="accountDeletionContent" label="Account Deletion content" initialContent={initial.deletionHtml} /><label className="cms-check"><input type="checkbox" checked={requiresAuth} onChange={(event) => setRequiresAuth(event.target.checked)} /> Requires authentication</label></div>
      </section>
      <section id="app-support" className="cms-card">
        <span className="cms-mono">06 · Support</span>
        <p className="cms-help">Every app has a public support page. Leave the email blank to use {DEFAULT_SUPPORT_EMAIL}.</p>
        <div className="cms-field"><label htmlFor="app-support-email">Support email</label><input id="app-support-email" name="supportEmail" type="email" defaultValue={initial.supportEmail ?? DEFAULT_SUPPORT_EMAIL} placeholder={DEFAULT_SUPPORT_EMAIL} /></div>
        <div className="cms-legal-editor"><RichTextEditor name="supportContent" label="Support content" initialContent={initial.supportHtml} /></div>
        <p className="cms-help">Optional. Add FAQs or troubleshooting instructions; an empty page shows the standard contact message.</p>
      </section>
    </div>
    <aside className="cms-editor-aside cms-save-aside"><div className="cms-card"><span className="cms-mono">On this page</span><nav className="cms-section-anchors" aria-label="App form sections"><a href="#app-basics">Basics</a><a href="#app-media">Media</a><a href="#app-links">Store links</a><a href="#app-details">Details</a>{platform === "mobile" && <a href="#app-legal">Legal pages</a>}<a href="#app-support">Support</a></nav><p className="cms-help">Saving updates your portfolio immediately.</p></div><CmsSubmitButton>{isNew ? "Create app" : "Save changes"}</CmsSubmitButton><Link href="/admin/content?type=app" className="cms-button">Cancel</Link></aside>
  </CmsSaveForm>;
}
