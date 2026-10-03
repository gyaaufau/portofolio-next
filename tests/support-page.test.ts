import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LegalContent } from "../src/components/legal-content";
import { supportEmailOrDefault } from "../src/lib/support";
import type { AppItem } from "../src/data/types";

function loadModule(path: string, imports: Record<string, unknown>) {
  const output = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports: Record<string, unknown> = {};
  vm.runInNewContext(output, { exports, Error, require: (name: string) => {
    if (name === "react/jsx-runtime") return jsx;
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
    return imports[name];
  } });
  return exports;
}

function publicDatabase(rows: Record<string, unknown>[]) {
  const db = { from: () => {
    const filters: Array<(row: Record<string, unknown>) => boolean> = [];
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { filters.push((row) => row[key] === value); return query; },
      single: async () => ({ data: rows.find((row) => filters.every((filter) => filter(row))) ?? null }),
    };
    return query;
  } };
  const loaded = loadModule("src/data/db.ts", {
    react: { cache: (fn: unknown) => fn },
    "next/headers": { cookies: async () => ({}) },
    "@/utils/supabase/server": { createClient: () => db },
    "@/lib/support": { supportEmailOrDefault },
  });
  return loaded.getAppBySlug as (slug: string) => Promise<AppItem | null>;
}

const baseRow = { id: "garden", slug: "garden", title: "Garden", app_type: "web", work_type: "personal", publication_status: "published", sections: [], stack: [], highlights: [] };

function supportPage(getAppBySlug: (slug: string) => Promise<AppItem | null>) {
  return loadModule("src/app/apps/[slug]/support/page.tsx", {
    "@/data/db": { getAppBySlug },
    "@/data/seo": { absoluteUrl: (path: string) => `https://gialoop.com${path}` },
    "next/navigation": { notFound: () => { throw new Error("404"); } },
    "@/components/back-link": { BackLink: ({ href, label }: { href: string; label: string }) => createElement("a", { href }, label) },
    "@/components/legal-content": { LegalContent },
  }) as {
    default: (props: { params: Promise<{ slug: string }> }) => Promise<React.ReactNode>;
    generateMetadata: (props: { params: Promise<{ slug: string }> }) => Promise<{ title: string; openGraph?: { url: string } }>;
  };
}

test("existing published apps get default contact support and metadata", async () => {
  const getApp = publicDatabase([baseRow]);
  const app = await getApp("garden");
  assert.equal(app?.supportEmail, "gyaaufau@gmail.com");
  assert.equal(app?.supportContent, "");
  const page = supportPage(getApp);
  const props = { params: Promise.resolve({ slug: "garden" }) };
  const html = renderToStaticMarkup(await page.default(props));
  assert.match(html, /<h1>Support<\/h1>/);
  assert.match(html, /For help with Garden, contact us by email\./);
  assert.match(html, /href="mailto:gyaaufau@gmail.com"/);
  assert.match(html, /href="\/apps\/garden"/);
  const metadata = await page.generateMetadata(props);
  assert.equal(metadata.title, "Support - Garden | Gialoop");
  assert.equal(metadata.openGraph?.url, "https://gialoop.com/apps/garden/support");
});

test("custom support renders Markdown safely and uses the overridden contact", async () => {
  const page = supportPage(publicDatabase([{ ...baseRow, support_email: "help@example.com", support_content: "## FAQ\n\n**Restart** the app.\n\n- Try again\n\n<script>alert(1)</script>" }]));
  const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ slug: "garden" }) }));
  assert.match(html, /href="mailto:help@example.com"/);
  assert.match(html, /<h2>FAQ<\/h2>/);
  assert.match(html, /<strong>Restart<\/strong>/);
  assert.match(html, /<li>Try again<\/li>/);
  assert.doesNotMatch(html, /<script|For help with Garden/);
});

test("unknown and unpublished apps cannot expose support pages", async () => {
  const getApp = publicDatabase([{ ...baseRow, publication_status: "draft" }]);
  for (const slug of ["garden", "missing"]) {
    assert.equal(await getApp(slug), null);
    const page = supportPage(getApp);
    const props = { params: Promise.resolve({ slug }) };
    await assert.rejects(page.default(props), /404/);
    assert.equal((await page.generateMetadata(props)).title, "Page Not Found");
  }
});

test("every app detail exposes Support even without legal pages", async () => {
  const app = await publicDatabase([baseRow])("garden");
  const link = ({ href, children }: { href: string; children: React.ReactNode }) => createElement("a", { href }, children);
  const icon = () => createElement("span");
  const loaded = loadModule("src/components/app-detail-view.tsx", {
    "next/image": { default: () => null }, "next/link": { default: link },
    "lucide-react": { AppWindow: icon, ArrowLeft: icon, ExternalLink: icon, GitFork: icon, Globe: icon, Mail: icon, Shield: icon, Smartphone: icon, Trash2: icon },
    "./screenshot-carousel": { ScreenshotCarousel: () => null },
  });
  const View = loaded.AppDetailView as (props: { app: AppItem }) => React.ReactNode;
  const html = renderToStaticMarkup(View({ app: app! }));
  assert.match(html, /href="\/apps\/garden\/support"/);
  assert.doesNotMatch(html, /privacy-policy|account-deletion/);
});
