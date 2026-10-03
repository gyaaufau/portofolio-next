import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { validateLegalContent } from "../src/lib/legal-content";

function appActions(error: { message: string } | null = null) {
  const paths: string[] = [];
  let saved: Record<string, unknown> | undefined;
  const database = {
    from: () => ({
      insert: async (record: Record<string, unknown>) => { saved = record; return { error }; },
      update: (record: Record<string, unknown>) => {
        saved = record;
        return { eq: () => ({ select: () => ({ single: async () => ({ data: { slug: "different-slug" }, error }) }) }) };
      },
    }),
  };
  const imports: Record<string, unknown> = {
    "next/headers": {}, "next/cache": { revalidatePath: (path: string) => paths.push(path) },
    "@/lib/storage": { storageUrl: (path: string) => path },
    "@/lib/auth": { requireAdmin: async () => {} },
    "@/utils/supabase/admin": { createAdminClient: () => database },
    "@/lib/legal-content": { validateLegalContent },
  };
  const output = ts.transpileModule(readFileSync("src/app/admin/actions.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports: Record<string, (arg: string | FormData, data?: FormData) => Promise<void>> = {};
  vm.runInNewContext(output, { exports, require: (name: string) => {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
    return imports[name];
  } });
  return { exports, paths, saved: () => saved };
}

function policyForm(content = "## Privacy\n\n**Local only**") {
  const form = new FormData();
  form.set("title", "Tilejoy");
  form.set("hasPrivacyPolicy", "on");
  form.set("privacyPolicyContent", content);
  return form;
}

test("app actions store Markdown and refresh legal paths using the saved slug", async () => {
  const { exports, paths, saved } = appActions();
  const form = policyForm();
  await exports.updateApp("database-id", form);
  assert.equal(saved()?.privacy_policy_content, form.get("privacyPolicyContent"));
  assert.equal(saved()?.has_privacy_policy, true);
  assert.ok(paths.includes("/apps/different-slug/privacy-policy"));
  assert.ok(paths.includes("/apps/different-slug/account-deletion"));
});

test("empty policies fail before a write and database failures do not report success", async () => {
  for (const action of ["createApp", "updateApp"]) {
    const state = appActions({ message: "Database unavailable" });
    const invoke = (form: FormData) => action === "createApp" ? state.exports[action](form) : state.exports[action]("tilejoy", form);
    await assert.rejects(invoke(policyForm("## \n\n** **")), /Privacy Policy content is required/);
    assert.equal(state.saved(), undefined);
    await assert.rejects(invoke(policyForm()), /Unable to save app: Database unavailable/);
    assert.deepEqual(state.paths, []);
  }
});
