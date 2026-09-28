export type HomeMetric = { value: string; label: string };

export type PublishedSkillCategory = { id: string; name: string; items: string[] };

export type PublishedSection = {
  id: string;
  label: string;
  anchor: string;
  sortOrder: number;
  visible: boolean;
  settings: Record<string, unknown>;
  headline?: string;
  subheadline?: string;
  cta?: string;
  heroAppId?: string;
  metrics?: HomeMetric[];
};

export type ResolvedHomeSection = PublishedSection & { metrics: HomeMetric[] };

const fallbackHomeSections = ["hero", "work", "about", "experience", "skills", "certificates", "notes", "contact"];

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function metrics(value: unknown): HomeMetric[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const metric = item as Record<string, unknown>;
    const valueText = text(metric.value);
    const label = text(metric.label);
    return valueText && label ? [{ value: valueText, label }] : [];
  });
}

export function publishedSections(sections: PublishedSection[]): Array<PublishedSection & { metrics: HomeMetric[] }> {
  return sections
    .filter((section) => section.visible)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((section) => ({
      ...section,
      headline: text(section.settings.headline),
      subheadline: text(section.settings.subheadline),
      cta: text(section.settings.cta),
      heroAppId: text(section.settings.heroAppId),
      metrics: metrics(section.settings.metrics),
    }));
}

export function resolveHomeSections(
  sections: ResolvedHomeSection[],
  hasConfiguredSections: boolean,
): ResolvedHomeSection[] {
  if (hasConfiguredSections) return sections;

  return fallbackHomeSections.map((id, sortOrder) => ({
    id,
    label: id,
    anchor: `#${id}`,
    sortOrder,
    visible: true,
    settings: {},
    metrics: [],
  }));
}

export function visibleSkillCategories(categories: PublishedSkillCategory[]): PublishedSkillCategory[] {
  return categories.flatMap((category) => {
    const items = category.items.map((item) => item.trim()).filter(Boolean);
    return items.length ? [{ ...category, items }] : [];
  });
}
