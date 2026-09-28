import assert from "node:assert/strict";
import test from "node:test";
import { resolveHomeSections, publishedSections, visibleSkillCategories } from "../src/lib/public-content";

test("publishedSections hides disabled sections and keeps the CMS order", () => {
  const sections = publishedSections([
    { id: "notes", label: "Notes", anchor: "#notes", sortOrder: 3, visible: true, settings: {} },
    { id: "hero", label: "Hero", anchor: "#hero", sortOrder: 0, visible: true, settings: {} },
    { id: "skills", label: "Skills", anchor: "#skills", sortOrder: 2, visible: false, settings: {} },
  ]);

  assert.deepEqual(sections.map((section) => section.id), ["hero", "notes"]);
});

test("publishedSections returns only complete hero metrics", () => {
  const [hero] = publishedSections([{ id: "hero", label: "Hero", anchor: "#hero", sortOrder: 0, visible: true, settings: {
    metrics: [{ value: "8 years", label: "Building mobile" }, { value: "", label: "Incomplete" }],
  } }]);

  assert.deepEqual(hero.metrics, [{ value: "8 years", label: "Building mobile" }]);
});

test("resolveHomeSections does not restore fallback sections when every CMS section is hidden", () => {
  const configuredSections = publishedSections([
    { id: "hero", label: "Hero", anchor: "#hero", sortOrder: 0, visible: false, settings: {} },
    { id: "notes", label: "Notes", anchor: "#notes", sortOrder: 1, visible: false, settings: {} },
  ]);

  assert.deepEqual(resolveHomeSections(configuredSections, true), []);
});

test("resolveHomeSections keeps the legacy fallback only without CMS section records", () => {
  assert.deepEqual(
    resolveHomeSections([], false).map((section) => section.id),
    ["hero", "work", "about", "experience", "skills", "certificates", "notes", "contact"],
  );
});

test("visibleSkillCategories drops empty categories and blank tool names", () => {
  const categories = visibleSkillCategories([
    { id: "mobile", name: "Mobile", items: [" Flutter ", "  "] },
    { id: "empty", name: "Empty", items: ["", "   "] },
  ]);

  assert.deepEqual(categories, [{ id: "mobile", name: "Mobile", items: ["Flutter"] }]);
});
