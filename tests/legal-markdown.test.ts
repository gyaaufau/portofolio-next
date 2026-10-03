import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { toLegalMarkdown } from "../src/lib/legal-content";
import { LegalContent } from "../src/components/legal-content";

test("legal Markdown renders headings, emphasis, lists and safe links", () => {
  const html = renderToStaticMarkup(createElement(LegalContent, { content: "## Privacy\n\n**Local only**\n\n- Photos\n- Progress\n\n[Contact](mailto:gyaaufau@gmail.com)" }));
  assert.match(html, /<h2>Privacy<\/h2>/);
  assert.match(html, /<strong>Local only<\/strong>/);
  assert.match(html, /<li>Photos<\/li>/);
  assert.match(html, /href="mailto:gyaaufau@gmail.com"/);
});

test("existing HTML becomes editable Markdown without losing content", () => {
  const html = "<h2>Privacy</h2><p><strong>Local only</strong></p><p><a href='mailto:gyaaufau@gmail.com'>Contact</a></p>";
  const markdown = toLegalMarkdown(html);
  assert.match(markdown, /^## Privacy/);
  assert.match(markdown, /\*\*Local only\*\*/);
  assert.match(markdown, /\[Contact\]\(mailto:gyaaufau@gmail.com\)/);
  assert.doesNotMatch(markdown, /<\/?[a-z]/i);
  assert.match(renderToStaticMarkup(createElement(LegalContent, { content: html })), /<strong>Local only<\/strong>/);
});

test("existing Markdown remains unchanged and unsafe HTML or links cannot execute", () => {
  const markdown = "## Privacy\n\n**Local only**";
  assert.equal(toLegalMarkdown(markdown), markdown);
  const html = renderToStaticMarkup(createElement(LegalContent, { content: "<script>alert(1)</script><p>Safe</p><a href='javascript:alert(1)'>Link</a>" }));
  assert.doesNotMatch(html, /<script|javascript:/i);
  assert.match(html, /Safe/);
});
