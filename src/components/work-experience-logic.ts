import type { WorkExperienceItem } from "@/data/types";

const employmentTypes = [
  { pattern: /\s+Part[\s-]?Time$/i, label: "Part-time" },
  { pattern: /\s+Full[\s-]?Time$/i, label: "Full-time" },
  { pattern: /\s+Freelance$/i, label: "Freelance" },
  { pattern: /\s+Contract$/i, label: "Contract" },
  { pattern: /\s+Internship$/i, label: "Internship" },
] as const;

function presentRole(role: string) {
  for (const employmentType of employmentTypes) {
    if (!employmentType.pattern.test(role)) continue;
    return {
      title: role.replace(employmentType.pattern, "").trim(),
      employmentType: employmentType.label,
    };
  }

  return { title: role, employmentType: null };
}

export function getWorkExperiencePresentation(experience: WorkExperienceItem) {
  const current = /\b(?:present|current|now)\b/i.test(`${experience.end} ${experience.period}`);

  return {
    current,
    density: current || experience.highlights.length > 0 ? "expanded" : "compact",
    ...presentRole(experience.role),
  } as const;
}
