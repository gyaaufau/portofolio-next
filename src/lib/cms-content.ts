export type ContentKind = "app" | "note" | "certificate" | "experience" | "skills";
export type ContentStatus = "draft" | "published";
export type ContentRow = { id: string; kind: ContentKind; title: string; status: ContentStatus; hasPublished: boolean; updatedAt: string; href: string };

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function draftEntityId(title: string) {
  return slugify(title) || crypto.randomUUID();
}

export function contentStatus(row: { publication_status?: string | null }): ContentStatus {
  return row.publication_status === "draft" ? "draft" : "published";
}

function contentHref(kind: ContentKind, id: string) {
  if (kind === "app") return `/admin/content/apps/${id}`;
  if (kind === "note") return `/admin/content/notes/${id}`;
  if (kind === "certificate") return `/admin/certificates/${id}/edit`;
  if (kind === "experience") return `/admin/work-experience/${id}/edit`;
  return "/admin/skills";
}

export function normalizeContentRows(
  published: Array<{ id: string; title: string; updated_at?: string | null; publication_status?: string | null }>,
  drafts: Array<{ id: string; kind: string; entity_id: string; title: string; updated_at?: string | null }>,
  kind: ContentKind,
): ContentRow[] {
  const rows = new Map<string, ContentRow>();
  for (const item of published) rows.set(item.id, {
    id: item.id, kind, title: item.title, status: contentStatus(item), hasPublished: contentStatus(item) === "published",
    updatedAt: item.updated_at ?? "", href: contentHref(kind, item.id),
  });
  for (const draft of drafts) if (draft.kind === kind) rows.set(draft.entity_id, {
    id: draft.entity_id, kind, title: draft.title, status: "draft", hasPublished: rows.get(draft.entity_id)?.hasPublished ?? false,
    updatedAt: draft.updated_at ?? "", href: contentHref(kind, draft.entity_id),
  });
  return [...rows.values()];
}
