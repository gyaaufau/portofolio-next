import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { getWorkExperiencePresentation } from "../src/components/work-experience-logic";
import type { WorkExperienceItem } from "../src/data/types";

const experiences: WorkExperienceItem[] = [
  {
    id: "compact",
    company: "Studio Example",
    location: "Bandung",
    role: "UI/UX Designer Part Time",
    start: "January 2024",
    end: "March 2024",
    period: "Jan 2024 - Mar 2024",
    sortOrder: 1,
    summary: "Refined a course platform and clarified its primary learning flows.",
    highlights: [],
  },
  {
    id: "current",
    company: "Product Example",
    location: "Jakarta",
    role: "Flutter Developer Freelance",
    start: "April 2024",
    end: "Present",
    period: "Apr 2024 - Present",
    sortOrder: 2,
    summary: "Owned implementation details across product behavior, interface quality, and testing.",
    highlights: ["Shipped a production mobile workflow.", "Collaborated directly with product and design."],
  },
];

test("work-experience cards select compact and expanded variants from real fields", () => {
  assert.equal(getWorkExperiencePresentation(experiences[0]).density, "compact");
  assert.equal(getWorkExperiencePresentation(experiences[1]).density, "expanded");
});

test("work-experience cards expose current status and separate known employment types", () => {
  const compact = getWorkExperiencePresentation(experiences[0]);
  const current = getWorkExperiencePresentation(experiences[1]);

  assert.equal(compact.current, false);
  assert.equal(compact.title, "UI/UX Designer");
  assert.equal(compact.employmentType, "Part-time");
  assert.equal(current.current, true);
  assert.equal(current.title, "Flutter Developer");
  assert.equal(current.employmentType, "Freelance");
});

test("work-experience presentation uses shared theme tokens without hardcoded colors", async () => {
  const [css, component] = await Promise.all([
    readFile(path.resolve("src/components/work-experience.module.css"), "utf8"),
    readFile(path.resolve("src/components/work-experience.tsx"), "utf8"),
  ]);

  for (const token of ["--card", "--foreground", "--muted-foreground", "--border", "--primary"]) {
    assert.match(css, new RegExp(`var\\(${token}\\)`), `${token} is not used by the card styles`);
  }
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b/i);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(component, /<ol/);
  assert.match(component, /<article/);
  assert.match(component, /aria-label="Current role"/);
  assert.match(component, /experience\.summary/);
  assert.match(component, /experience\.highlights/);
  assert.match(component, /className=\{styles\.node\}/);
  assert.doesNotMatch(component, /previousNode|currentNode/);
  assert.match(css, /\.node::after/);
  assert.match(css, /\.card::before[\s\S]*?width: 1\.1rem;[\s\S]*?height: 1\.1rem;/);
});
