# Prisma PostgreSQL Data Layer

This document defines persistence ownership, source-of-truth rules, schema authority, migrations, synchronization, and operational setup for the Prisma + PostgreSQL data layer.

---

## 1. Responsibility

This system owns:

- All portfolio content (apps, certificates, work experience, profile, contact, skills)
- Site settings (accent color/theme)
- App screenshots (cascading with App)

It does not own:

- Static assets (images, CV PDF, brand files) — served from Cloudflare R2 (see `docs/integrations/r2-assets.md`)
- Admin sessions — JWT in HTTP-only cookie, not persisted in DB
- Game state — client-side Phaser engine

---

## 2. Source of Truth

Authoritative current runtime state:

```text
prisma/schema.prisma
+
prisma/migrations/ (applied)
=
CURRENT DATABASE STATE
```

Secondary references:

- `prisma/seed.ts` — development seeding and demo data
- `src/data/types.ts` — TypeScript type definitions (mirror schema)
- `src/data/db.ts` — query functions (read layer)
- `docs/features/*.md` — application behavior and ownership

When documentation conflicts with executable schema/migrations, prefer runtime state.

---

## 3. Environments

| Environment | Purpose | Config Source |
|---|---|---|
| Development | Local development | `.env` with `DATABASE_URL` |
| Production | Live portfolio | Environment variables (hosting platform) |

Environment variables:

```text
DATABASE_URL       — PostgreSQL connection string
ADMIN_PASSWORD     — Admin login password (plain text, timing-safe comparison)
ADMIN_SESSION_SECRET — JWT signing secret (32+ characters)
```

Never commit secrets. `.env` is in `.gitignore`.

---

## 4. Ownership Model

| Data | Owner Key | Notes |
|---|---|---|
| Profile | `id` (cuid) | Singleton — only one row expected |
| Contact | `id` (cuid) | Singleton — only one row expected |
| HeroLink | `id` (cuid) | Ordered by `order` field |
| DirectoryLink | `id` (cuid) | Ordered by `order` field |
| App | `id` (string, slug-based) | Unique `slug` for public URLs |
| AppScreenshot | `id` (cuid) | Cascading delete with App |
| Certificate | `id` (string, slug-based) | Used directly in URL |
| WorkExperience | `id` (cuid) | Ordered by `sortOrder` field |
| SkillCategory | `id` (cuid) | Unique `name` field |
| SiteSettings | `id` (fixed "site") | Singleton — only one row expected |

---

## 5. Read Paths

```text
Server Component (page.tsx)
→ Data Access Function (src/data/db.ts)
→ Prisma Client (src/lib/prisma.ts)
→ PostgreSQL
```

Key read functions:

| Function | Returns | Used By |
|---|---|---|
| `getPortfolio()` | Aggregated homepage data | Homepage |
| `getApps()` | All apps with screenshots | App catalog |
| `getFeaturedApps()` | Top 3 featured apps | Homepage |
| `getAppBySlug(slug)` | Single app | App detail page |
| `getCertificates()` | All certificates | Certificate list |
| `getFeaturedCertificates()` | Top 3 featured (with fallback) | Homepage |
| `getCertificateBySlug(id)` | Single certificate | Certificate detail page |
| `getWorkExperiences()` | All experiences (ordered) | Homepage |
| `getProfile()` | Single profile | Homepage |
| `getContact()` | Single contact | Homepage |
| `getHeroLinks()` | All hero links (ordered) | Homepage |
| `getDirectoryLinks()` | All directory links (ordered) | Homepage |
| `getSkillCategories()` | All skill categories | Homepage |
| `getSiteSettings()` | Site settings (with defaults) | Root layout |

Important read rules:

- Public pages use ISR (`revalidate = 3600`) — cached static generation with hourly revalidation
- All data functions wrapped with `React.cache()` for request-level deduplication
- `getSiteSettings()` has fallback defaults if DB query fails
- `getFeaturedCertificates()` falls back to latest 3 if fewer than 3 are featured
- `getPortfolio()` aggregates multiple queries via `Promise.all`

---

## 6. Write Paths

```text
Admin Form (FormData)
→ Server Action (src/app/admin/actions.ts)
→ requireAdmin() guard
→ Prisma Write
→ revalidatePath() (cache invalidation)
→ Updated public page
```

Key write operations:

| Action | Server Action | Revalidation |
|---|---|---|
| Create App | `createApp(formData)` | `/admin/apps`, `/apps`, `/` |
| Update App | `updateApp(id, formData)` | `/admin/apps`, `/apps/[id]`, `/apps`, `/` |
| Delete App | `deleteApp(id)` | `/admin/apps`, `/apps`, `/` |
| Toggle Featured | `toggleAppFeatured(id)` | `/admin/apps`, `/apps`, `/` |
| Create Certificate | `createCertificate(formData)` | `/admin/certificates`, `/certificates` |
| Update Certificate | `updateCertificate(id, formData)` | `/admin/certificates`, `/certificates/[id]`, `/certificates` |
| Delete Certificate | `deleteCertificate(id)` | `/admin/certificates`, `/certificates` |
| Create Work Experience | `createWorkExperience(formData)` | `/admin/work-experience`, `/` |
| Update Work Experience | `updateWorkExperience(id, formData)` | `/admin/work-experience`, `/` |
| Delete Work Experience | `deleteWorkExperience(id)` | `/admin/work-experience`, `/` |
| Update Profile | `updateProfile(formData)` | `/admin/profile`, `/` |
| Update Contact | `updateContact(formData)` | `/admin/contact`, `/` |
| Update Skill Category | `updateSkillCategory(id, formData)` | `/admin/skills`, `/` |
| Update Site Settings | `updateSiteSettings(prev, formData)` | `/`, `/admin/appearance` |

Important write rules:

- All mutations guarded by `requireAdmin()` — redirects to login if invalid
- `formData` parsed via `Object.fromEntries(formData)`
- Arrays stored as PostgreSQL arrays: `String[]`, `Int[]`, `Json`
- Stack items: comma-separated string → `split(",").map(trim).filter(Boolean)`
- Highlights/details: newline-separated string → `split("\n").filter(Boolean)`
- Sections: JSON string → `JSON.parse()` → stored as Prisma `Json` type

---

## 7. Schema and Migrations

Schema location:

```text
prisma/schema.prisma
```

Migration location:

```text
prisma/migrations/
```

Models:

| Model | Key Fields | Relations |
|---|---|---|
| Profile | name, role, intro, location, openToOpportunities, photo* | None |
| Contact | email, whatsapp, github, linkedin, playStore, playConsole, cv | None |
| HeroLink | label, href, kind, note, order | None |
| DirectoryLink | title, value, href, caption, order | None |
| App | title, slug, tagline, description, featured, appType, workType, period, stack[], highlights[], sections (Json) | hasMany AppScreenshot |
| AppScreenshot | src, alt, width, height, order | belongsTo App (cascade delete) |
| Certificate | title, featured, issuer, issued, type, summary, details[], relevance, issuerNotes[], image* | None |
| WorkExperience | company, location, role, start, end, period, sortOrder, summary, highlights[] | None |
| SkillCategory | name (unique), items[] | None |
| SiteSettings | accentPreset, accentColor | None |

Rules:

- Migrations are append-only
- Do not rewrite applied migrations
- Document destructive operations
- Seed data separate from schema changes

---

## 8. Seed and Import Data

Seed location:

```text
prisma/seed.ts
```

Import process:

```bash
npx prisma db seed
```

What seed creates:

- 1 SiteSettings (moss accent)
- 1 Profile (Argya Aulia Fauzandika)
- 1 Contact (email, social links)
- 2 HeroLinks (View my work, Download CV)
- 6 DirectoryLinks (CV, Play Store, GitHub, LinkedIn, WhatsApp, Email)
- 3 SkillCategories (skills, tech, softSkills)
- 4 Apps with screenshots (Shou, OtoLog, Litbang AU, Ditonton)
- 3 Certificates (Dicoding Conference, Flutter Expert, E-commerce Bootcamp)
- 5 WorkExperiences (Shou Corp, LKP Grafologi, Litbang TNI AU, Mindo Education, Gialoop)

Idempotency:

Seed cleans all existing data before inserting (`deleteMany()` on all tables). Not idempotent — destructive in production.

---

## 9. Sync and Cache

Source of truth:

`PostgreSQL`

Cache:

ISR with 1-hour revalidation (`revalidate = 3600`). `React.cache()` deduplicates queries within a single request.

Sync direction:

```text
N/A — Single database, no sync
```

Conflict strategy:

None — single-writer (admin) model

Offline behavior:

No offline support. Pages fail if database is unreachable (handled by `error.tsx`).

---

## 10. Security

Authentication:

Admin login via password → JWT cookie (7-day expiry) → `requireAdmin()` guard on all protected routes and mutations

Authorization:

Single admin model — no role system. Either authenticated (can mutate) or not (redirected to login).

Secrets:

- `DATABASE_URL` — PostgreSQL connection string (env var)
- `ADMIN_PASSWORD` — Admin password (env var)
- `ADMIN_SESSION_SECRET` — JWT signing secret (env var)

Do not describe secret values.

---

## 11. Operational Checks

```bash
npx prisma validate     # Validate schema syntax
npx prisma migrate deploy  # Apply pending migrations
npx prisma db seed      # Seed database (destructive)
npm run build           # Verify build succeeds
```

Smoke tests:

- Homepage loads and displays portfolio data
- `/admin/login` accepts valid password
- Admin can create/update/delete apps
- Public pages reflect admin changes after revalidation

---

## 12. Known Limitations

- No production caching — every request hits PostgreSQL
- Seed is destructive — not safe for production use
- No database backup strategy in repository
- No connection pooling configuration (uses default Prisma behavior)
- Json type for `sections` parsed via `parseSections()` with try/catch fallback in admin actions
- Indexes added: `App(featured,sortOrder)`, `AppScreenshot(appId,order)`, `Certificate(featured,issued)`, `WorkExperience(sortOrder)`
- Singleton models (Profile, Contact, SiteSettings) have no enforcement of single-row constraint at DB level

---

## 13. Update Rules

Update this file when:

- source-of-truth rules change,
- ownership changes,
- schema authority changes,
- migrations change application behavior,
- synchronization changes,
- environment setup changes.
