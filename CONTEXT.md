# portofolio_next Context

This file defines the shared product/domain language used by humans and coding agents.

It is not:

- an architecture document,
- a feature specification,
- a database schema,
- a route inventory,
- a changelog,
- an implementation guide.

Use:

- `AGENTS.md` for invariant implementation guardrails,
- `docs/architecture.md` for global technical architecture,
- `docs/features/*.md` for detailed feature behavior,
- this file for canonical terms, relationships, lifecycle boundaries, and commonly confused concepts.

---

## 1. Product Summary

**Product:** Gialoop Portfolio

**One-line description:**
A database-backed Next.js portfolio for Argya Aulia Fauzandika, showcasing Flutter apps, certificates, work experience, and a playable pixel-art hero game.

**Primary users:**
- Visitors: recruiters, collaborators, and developers viewing portfolio work
- Admin: Argya (single admin managing content via password-protected panel)

**Primary outcome:**
Present Flutter development work and professional credentials in a polished, performant web portfolio with admin-managed content.

---

## 2. Core Relationship Map

```text
Profile
  ↓ owns / contains
HeroLink, Contact, SkillCategory
  ↓ referenced by
Homepage
  ↓ sections display
App[] ← AppScreenshot[]
Certificate[]
WorkExperience[]
  ↓ managed by
Admin Panel (Server Actions)
  ↓ persists to
PostgreSQL (Prisma)
```

---

## 3. Actors

### Visitor

Definition:

Any unauthenticated user browsing the public portfolio site.

Responsibilities:

- View homepage sections (hero, apps, experience, about, certificates, contact)
- Browse app catalog and detail pages
- Browse certificate list and detail pages
- Download/view CV
- Play hero game (if WebGL available)

Not the same as:

- Admin — has authenticated session and can modify data

### Admin

Definition:

The single authenticated user (Argya) who manages portfolio content.

Responsibilities:

- Login via password
- Create, update, delete apps, certificates, work experience
- Update profile, contact info, skills
- Change site accent color/appearance

Not the same as:

- Visitor — cannot modify data

---

## 4. Core Domain Terms

### App

Definition:

A portfolio project entry representing a shipped product (mobile app, web app, desktop app, or backend). Contains title, description, screenshots, stack, highlights, and detailed sections.

Lifecycle or ownership:

Created and managed by Admin via `/admin/apps`. Displayed publicly on homepage (featured) and `/apps` catalog.

Related concepts:

- `AppScreenshot` — images associated with an App
- `AppType` — "mobile" | "desktop" | "web" | "backend"
- `WorkType` — "personal" | "work"

Not the same as:

- `Certificate` — represents learning/training, not shipped work

Status:

`current`

### Certificate

Definition:

A professional credential, course completion, or conference attendance record. Contains issuer, date, summary, details, and optional image.

Lifecycle or ownership:

Created and managed by Admin via `/admin/certificates`. Displayed publicly on homepage (featured) and `/certificates` list.

Related concepts:

- `CertificateImage` — optional image for the certificate

Not the same as:

- `App` — represents shipped work, not learning milestones

Status:

`current`

### WorkExperience

Definition:

A professional work entry with company, role, dates, location, summary, and highlights.

Lifecycle or ownership:

Created and managed by Admin via `/admin/work-experience`. Displayed publicly on homepage.

Related concepts:

None.

Not the same as:

- `App` — represents shipped products, not employment history

Status:

`current`

### Profile

Definition:

The single personal profile record containing name, role, intro, location, open-to-opportunities flag, and photo.

Lifecycle or ownership:

Managed by Admin via `/admin/profile`. Singleton record. Displayed in hero section and about section.

Related concepts:

- `Contact` — separate record for contact links

Not the same as:

- `Contact` — Profile is about identity; Contact is about reachability

Status:

`current`

### Contact

Definition:

The single contact record containing email, WhatsApp, GitHub, LinkedIn, Play Store, Play Console, and CV links.

Lifecycle or ownership:

Managed by Admin via `/admin/contact`. Singleton record. Displayed in contact section.

Related concepts:

- `Profile` — separate record for personal info

Not the same as:

- `Profile` — Contact is about reachability; Profile is about identity

Status:

`current`

### SkillCategory

Definition:

A named category of skills/technologies (e.g., "skills", "tech", "softSkills") with an array of string items.

Lifecycle or ownership:

Managed by Admin via `/admin/skills`. Displayed in about section.

Related concepts:

None.

Not the same as:

- `App.stack` — stack is per-app; SkillCategory is global

Status:

`current`

### SiteSettings

Definition:

Singleton record storing the site accent color preset and custom hex value. Injected into root layout as CSS custom property.

Lifecycle or ownership:

Managed by Admin via `/admin/appearance`. Singleton record (id="site").

Related concepts:

- `AccentPreset` — "moss" | "ember" | "berry" | "lake" | "custom"

Not the same as:

- `globals.css` — static styles; SiteSettings is dynamic per-admin-choice

Status:

`current`

### HeroLink

Definition:

A call-to-action link displayed in the hero section (e.g., "View my work", "Download CV"). Ordered by `order` field.

Lifecycle or ownership:

Seeded in `prisma/seed.ts`. Currently no admin management UI.

Related concepts:

- `DirectoryLink` — similar but for directory/contact section

Not the same as:

- `DirectoryLink` — HeroLink is for hero CTAs; DirectoryLink is for contact directory

Status:

`current`

### DirectoryLink

Definition:

A contact/resource link displayed in the directory section (e.g., GitHub, LinkedIn, WhatsApp). Ordered by `order` field.

Lifecycle or ownership:

Seeded in `prisma/seed.ts`. Currently no admin management UI.

Related concepts:

- `HeroLink` — similar but for hero section

Not the same as:

- `HeroLink` — DirectoryLink is for contact directory; HeroLink is for hero CTAs

Status:

`current`

### HeroGame

Definition:

A playable game rendered in the hero section. Managed via a typed registry in `src/games/registry.ts`. Currently only "pixel-fighter" (Pixel Duel) is registered.

Lifecycle or ownership:

Defined in `src/games/`. Loaded lazily via dynamic import. Engine: Phaser 4.1.

Related concepts:

- `HeroGameDefinition` — type definition for a registered game
- `HeroGameId` — type union of registered game IDs

Not the same as:

- Regular portfolio content — HeroGame is interactive, not informational

Status:

`current`

### AppScreenshot

Definition:

An image associated with an App, with src, alt, dimensions, and display order.

Lifecycle or ownership:

Created/deleted cascading with App. Managed via admin app forms.

Related concepts:

- `App` — parent entity

Not the same as:

- Certificate image — separate entity with different structure

Status:

`current`

---

## 5. Lifecycle Boundaries

### Content Creation Flow

```text
Admin Login
→ Navigate to /admin/[section]
→ Create/Update Form
→ Server Action (requireAdmin)
→ Prisma Write
→ revalidatePath
→ Public Page Updated
```

### Visitor Consumption Flow

```text
Visitor Request
→ Next.js Server Component
→ Prisma Query (src/data/db.ts)
→ HTML Response
→ Client Hydration (ScrollReveal, Navbar, Game)
```

---

## 6. Canonical Ownership

| Concept | Canonical Owner | Notes |
|---|---|---|
| Portfolio data | PostgreSQL via Prisma | Single source of truth |
| Admin auth | `src/lib/auth.ts` | JWT creation/verification |
| Site theme | `SiteSettings` DB row | Accent color |
| Data queries | `src/data/db.ts` | All Prisma queries |
| Types | `src/data/types.ts` | All TypeScript types |
| Server Actions | `src/app/admin/actions.ts` | All mutations |
| Game engine | `src/games/` | Phaser 4.1 |
| UI components | `src/components/` | Shared + shadcn |
| Routes | `src/app/` | File-based routing |

---

## 7. Terminology Boundaries

### `App` != `AppType`

`App` is the portfolio project entity.

`AppType` is the enum: "mobile" | "desktop" | "web" | "backend".

The distinction matters because AppType affects display filtering and categorization.

### `featured` != `sortOrder`

`featured` is a boolean flag for homepage display.

`sortOrder` is a numeric value for catalog ordering.

Featured apps appear on homepage; sortOrder controls order within listings.

### `slug` != `id`

`slug` is the URL-friendly identifier (used in public routes).

`id` is the database primary key (used in admin routes and Prisma queries).

For Apps, `id` and `slug` are currently identical. For Certificates, `id` is used as the slug.

---

## 8. Canonical Names and Aliases

| Canonical Term | Alias / Historical Name | Guidance |
|---|---|---|
| App | Project | Legacy. Use `App` in new code/docs. `/projects` redirects to `/apps`. |
| HeroGame | FightGame | Legacy. Use `HeroGame` in new code. `public/FIGHTGAME_Assets` is the source art directory. |
| SiteSettings | Theme Settings | Use `SiteSettings` (matches Prisma model). |
| AccentPreset | Theme Preset | Use `AccentPreset` (matches TypeScript type). |

---

## 9. Current vs Future Concepts

### Current Runtime Concepts

- `App` — fully implemented with CRUD and public display
- `Certificate` — fully implemented with CRUD and public display
- `WorkExperience` — fully implemented with CRUD and public display
- `Profile` — fully implemented with update and public display
- `Contact` — fully implemented with update and public display
- `SkillCategory` — fully implemented with update and public display
- `SiteSettings` — fully implemented with update and theme injection
- `HeroGame` — fully implemented with game registry and Phaser engine

### Reserved / Future Concepts

- `Blog` — route exists (`/blog`) but content is hardcoded; no CMS management
- `GamePreview` — route directory exists (`/game-preview`) but is empty
- `HeroLink` — seeded but no admin management UI
- `DirectoryLink` — seeded but no admin management UI

### Legacy Concepts

- `Project` — renamed to `App`; `/projects` redirects to `/apps`
- `FightGame` — renamed to HeroGame; `FIGHTGAME_Assets` is legacy naming in public assets

---

## 10. Current Ambiguities

### Certificate slug vs id

Observed:

Certificate routes use `[slug]` parameter name, but the data function `getCertificateBySlug(id)` takes `id`. The Prisma query uses `where: { id }`.

Most authoritative current behavior:

Certificate `id` serves as both primary key and URL slug. Route parameter is named `slug` for consistency with App routes.

Still unclear:

Whether to rename the route parameter to `[id]` or keep `[slug]` for consistency.

---

## 11. Update Rules

Update this file when:

- a canonical domain term changes,
- ownership of a domain concept changes,
- a new core concept becomes real,
- a legacy term is replaced,
- a lifecycle boundary changes,
- a major ambiguity is resolved.

Do not update for:

- minor UI copy,
- route changes,
- implementation details,
- dependency changes,
- temporary experiments,
- daily progress.
