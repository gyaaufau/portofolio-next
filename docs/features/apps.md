# Apps Catalog

## Purpose

The apps feature provides a browsable catalog of portfolio projects (mobile apps, web apps, desktop apps, backend systems). Visitors can view all apps or drill into individual app detail pages with screenshots, stack, highlights, and detailed sections.

---

## Ownership

This feature owns:

- App catalog page (`/apps`)
- App detail page (`/apps/[slug]`)
- App card component
- App screenshot carousel

This feature does not own:

- Admin app management (owned by `admin`)
- Featured apps on homepage (owned by `homepage`)

Related features:

- `homepage` — displays featured apps (top 3)
- `admin` — CRUD operations for apps

---

## Entry Points

The feature can be entered from:

- Homepage "Browse all apps" link
- Homepage featured app cards
- Navbar "Apps" link
- Direct URL `/apps` or `/apps/[slug]`

Primary route(s):

```text
/apps            → App catalog
/apps/[slug]     → App detail
```

---

## User Flow

```text
Visitor clicks "Apps" or "Browse all apps"
→ /apps catalog page
→ See all apps as cards (icon, title, tagline, period)
→ Click app card
→ /apps/[slug] detail page
→ View screenshots, description, stack, highlights, sections
→ Navigate back to catalog or homepage
```

---

## State Lifecycle

State owner:

```text
Server Component (src/app/apps/page.tsx, src/app/apps/[slug]/page.tsx)
```

Lifecycle:

```text
Request
→ getApps() or getAppBySlug(slug)
→ Prisma query
→ Render Server Component
→ HTML response
```

Important state rules:

- ISR (`revalidate = 3600`) — cached static generation with hourly revalidation
- No client-side state management

Long-lived state:

None — every request fetches fresh.

---

## Data Flow

```text
src/app/apps/page.tsx
→ getApps() (src/data/db.ts)
→ prisma.app.findMany({ include: screenshots, orderBy: sortOrder desc })
→ mapApp() → AppItem[]

src/app/apps/[slug]/page.tsx
→ getAppBySlug(slug) (src/data/db.ts)
→ prisma.app.findUnique({ where: { slug }, include: screenshots })
→ mapApp() → AppItem | null
```

Primary models:

| Model / Concept | Purpose |
|---|---|
| App | Portfolio project entry |
| AppScreenshot | Images for app detail page |
| AppType | "mobile" \| "desktop" \| "web" \| "backend" |
| WorkType | "personal" \| "work" |

---

## Persistence

Source of truth:

`PostgreSQL` via Prisma `App` model

Write rules:

- All writes via admin Server Actions
- `revalidatePath("/apps")` and `revalidatePath("/")` after mutations

Read rules:

- `getApps()` — all apps with screenshots, ordered by `sortOrder desc`
- `getAppBySlug(slug)` — single app by slug, includes screenshots
- `getFeaturedApps()` — featured only, limit 3 (used by homepage)

---

## External Integrations

- `JSON-LD` — CollectionPage schema on `/apps` catalog

---

## Failure and Edge Cases

| Case | Expected Behavior |
|---|---|
| No apps exist | "No apps have been published here yet." message |
| Invalid slug | `notFound()` called, 404 page shown |
| Database error | `error.tsx` catches and shows retry UI |
| Empty screenshots | App detail renders without carousel |

---

## UI Ownership

Pages/screens:

- `src/app/apps/page.tsx` — Catalog page
- `src/app/apps/[slug]/page.tsx` — Detail page

Feature-owned components:

- `src/components/app-card.tsx` — App card for catalog
- `src/components/app-detail-view.tsx` — App detail layout
- `src/components/screenshot-carousel.tsx` — Screenshot gallery

Shared components used:

- `src/components/back-link.tsx` — Back navigation
- `src/components/section-shell.tsx` — Section wrapper

---

## Testing Priorities

Prioritize:

- `getApps()` returns all apps with screenshots
- `getAppBySlug()` returns null for invalid slug
- App type normalization logic
- Screenshot ordering

---

## Known Limitations

- No search or filtering in catalog
- No pagination
- Sections stored as unvalidated JSON

---

## Where to Change

| Change | Primary Location |
|---|---|
| Catalog page | `src/app/apps/page.tsx` |
| Detail page | `src/app/apps/[slug]/page.tsx` |
| App card | `src/components/app-card.tsx` |
| Detail view | `src/components/app-detail-view.tsx` |
| Screenshot carousel | `src/components/screenshot-carousel.tsx` |
| Data queries | `src/data/db.ts` |
| Types | `src/data/types.ts` |

---

## Update Rules

Update this document when:

- App catalog behavior changes
- Detail page layout changes
- App model fields change
- Filtering or search is added
