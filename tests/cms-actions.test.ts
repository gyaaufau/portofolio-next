import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { appLegalFields } from "../src/lib/cms-app";
import { draftEntityId, slugify } from "../src/lib/cms-content";
import { publishDraftBatch } from "../src/lib/cms-publish";

type Row = Record<string, unknown>;
function cmsActions() {
  const tables: Record<string, Row[]> = { app:[], cms_note:[], certificate:[], work_experience:[], cms_draft:[], cms_section:[] };
  const paths: string[] = [];
  let failure = false;
  let authorized = true;
  let databaseAccess = 0;
  function from(table: string) {
    databaseAccess++;
    const filters: Array<(row: Row) => boolean> = [];
    let remove = false;
    const result = () => {
      if (failure) return { data:null, error:{ message:"Database unavailable" } };
      const rows = tables[table].filter((row) => filters.every((filter) => filter(row)));
      if (remove) tables[table] = tables[table].filter((row) => !rows.includes(row));
      return { data:rows, error:null };
    };
    const query = {
      select() { return query; },
      eq(key: string, value: unknown) { filters.push((row) => row[key] === value); return query; },
      in(key: string, values: unknown[]) { filters.push((row) => values.includes(row[key])); return query; },
      order() { return query; },
      delete() { remove = true; return query; },
      async maybeSingle() { const value = result(); return { ...value, data:value.data?.[0] ?? null }; },
      async single() { return query.maybeSingle(); },
      async upsert(records: Row | Row[]) {
        if (failure) return { error:{ message:"Database unavailable" } };
        for (const record of Array.isArray(records) ? records : [records]) {
          const existing = tables[table].find((row) => table === "cms_draft" ? row.kind === record.kind && row.entity_id === record.entity_id : row.id === record.id);
          if (existing) Object.assign(existing, record); else tables[table].push({ ...record });
        }
        return { error:null };
      },
      then(resolve: (value: ReturnType<typeof result>) => unknown) { return Promise.resolve(result()).then(resolve); },
    };
    return query;
  }
  const imports: Record<string, unknown> = {
    "next/cache": { revalidatePath:(path: string) => paths.push(path) },
    "next/navigation": { redirect:(path: string) => { throw new Error(`Redirect:${path}`); } },
    "@/lib/auth": { requireAdmin:async () => { if (!authorized) throw new Error("Unauthorized"); } },
    "@/lib/cms-content": { draftEntityId, slugify },
    "@/lib/cms-app": { appLegalFields },
    "@/lib/cms-publish": { publishDraftBatch },
    "@/utils/supabase/admin": { createAdminClient:() => ({ from, rpc:async (_: string, args: { p_record: Row }) => {
      if (failure) return { error:{ message:"Database unavailable" } };
      const existing = tables.app.find((row) => row.id === args.p_record.id);
      if (existing) Object.assign(existing, args.p_record); else tables.app.push({ ...args.p_record });
      return { error:null };
    } }) },
  };
  const output = ts.transpileModule(readFileSync("src/app/admin/cms-actions.ts", "utf8"), { compilerOptions:{ module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2020 } }).outputText;
  const exports: Record<string, (...args: unknown[]) => Promise<void | { error: string }>> = {};
  vm.runInNewContext(output, { exports, crypto, require:(name: string) => {
    if (!(name in imports)) throw new Error(`Unexpected import:${name}`);
    return imports[name];
  } });
  return { exports, tables, paths, fail:() => { failure = true; }, deny:() => { authorized = false; }, accesses:() => databaseAccess };
}
function appForm() {
  const form = new FormData();
  for (const [key,value] of Object.entries({ title:"Garden", appType:"mobile", legalFieldsPresent:"on", hasPrivacyPolicy:"on", privacyPolicyContent:"## Privacy", hasAccountDeletion:"on", accountDeletionContent:"Email us to delete your account", accountDeletionRequiresAuth:"on" })) form.set(key,value);
  return form;
}

test("creating an app saves it live with legal fields and no draft", async () => {
  const state = cmsActions();
  await state.exports.saveCmsContent("app", "new", appForm());
  assert.equal(state.tables.app[0].publication_status, "published");
  assert.equal(state.tables.app[0].has_privacy_policy, true);
  assert.equal(state.tables.app[0].has_account_deletion, true);
  assert.equal(state.tables.app[0].account_deletion_requires_auth, true);
  assert.equal(state.tables.cms_draft.length, 0);
  assert.ok(state.paths.includes("/"));
});

test("legacy app changes survive failed saving and are removed after success", async () => {
  for (const fails of [true, false]) {
    const state = cmsActions();
    state.tables.app.push({ id:"garden", title:"Old title" });
    state.tables.cms_draft.push({ kind:"app", entity_id:"garden", payload:{ title:"Garden" } });
    if (fails) {
      state.fail();
      const result = await state.exports.saveCmsContent("app","garden",appForm());
      assert.match(result?.error || "", /Database unavailable/);
      assert.equal(state.tables.cms_draft.length, 1);
      assert.equal(state.tables.app[0].title, "Old title");
    } else {
      await state.exports.saveCmsContent("app","garden",appForm());
      assert.equal(state.tables.cms_draft.length, 0);
      assert.equal(state.tables.app[0].title, "Garden");
    }
  }
});

test("only note drafts can be created or published", async () => {
  const state = cmsActions();
  await assert.rejects(state.exports.publishCmsDraft("app","garden"), /Only notes/);
  await assert.rejects(state.exports.saveCmsDraft("certificate","new",appForm()), /Only%20notes/);
  assert.equal(state.accesses(), 0);
});

test("bulk publishing leaves non-blog unsaved changes untouched", async () => {
  const state = cmsActions();
  state.tables.cms_draft.push({ kind:"app", entity_id:"garden", title:"Garden", payload:{ title:"Garden" } }, { kind:"note", entity_id:"story", title:"Story", payload:{ title:"Story", body:"Hello" } });
  await assert.rejects(state.exports.publishAllCmsDrafts(), /Redirect:.*type=note/);
  assert.equal(state.tables.cms_note.length, 1);
  assert.equal(state.tables.app.length, 0);
  assert.deepEqual(state.tables.cms_draft.map((row) => row.kind), ["app"]);
});

test("unauthorized direct saving never reaches the database", async () => {
  const state = cmsActions();
  state.deny();
  await assert.rejects(state.exports.saveCmsContent("app","new",appForm()), /Unauthorized/);
  assert.equal(state.accesses(), 0);
});

test("section saving writes live order and visibility without creating drafts", async () => {
  const state = cmsActions();
  const form = new FormData();
  form.set("sections", JSON.stringify([{ id:"apps", visible:false }, { id:"hero", visible:true }]));
  await state.exports.saveCmsSections(form);
  assert.equal(state.tables.cms_section[0].sort_order, 0);
  assert.equal(state.tables.cms_section[0].visible, false);
  assert.equal(state.tables.cms_section[1].sort_order, 1);
  assert.equal(state.tables.cms_section[1].visible, true);
  assert.equal(state.tables.cms_draft.length, 0);
});
