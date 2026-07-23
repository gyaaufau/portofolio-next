# Homepage

## Purpose

The homepage is the primary entry point for visitors. It presents the full portfolio in a single scrollable page: hero with playable game, featured apps, work experience, skills/about, certificates, and contact.

---

## Ownership

This feature owns:

- Hero section with name, role, intro, location, and open-to-opportunities badge
- Featured apps section (top 3)
- Work experience section
- About/skills section
- Featured certificates section (top 3)
- Contact section

This feature does not own:

- App detail pages (owned by `apps`)
- Certificate detail pages (owned by `certificates`)
- Navbar and footer (owned by `public-chrome`)
- Hero game engine (owned by `hero-game`)

Related features:

- `apps` — displays featured apps; links to `/apps` catalog
- `certificates` — displays featured certificates; links to `/certificates` list
- `hero-game` — playable game in hero section
- `admin` — manages all displayed data

---

## Entry Points

The feature can be entered from:

- Direct URL `/`
- Navbar "Home" link
- Logo link in navbar

Primary route(s):

```text
/
```

---

## User Flow

```text
Visitor lands on /
→ Hero section (name, role, intro, game)
→ Scroll down through sections
→ Click "Browse all apps" → /apps
→ Click "View all certificates" → /certificates
→ Click contact links (email, WhatsApp, GitHub, LinkedIn)
→ Click "Download CV" → /cv
```

---

## State Lifecycle

State owner:

```text
Server Component (src/app/page.tsx)
```

Lifecycle:

```text
Request
→ getPortfolio() (Promise.all with 7 queries)
→ Render Server Component
→ HTML response
```

Important state rules:

- Dynamic request-time rendering
- `React.cache()` deduplicates data queries within a single request
- No client-side state management
- All data fetched server-side

Long-lived state:

None - every request fetches fresh from PostgreSQL.

---

## Data Flow

```text
src/app/page.tsx
→ getPortfolio() (src/data/db.ts)
→ Promise.all([
    getProfile(),
    getContact(),
    getHeroLinks(),
    getSkillCategories(),
    getFeaturedApps(),
    getFeaturedCertificates(),
    getWorkExperiences()
  ])
→ Prisma Client (src/lib/prisma.ts)
→ PostgreSQL
```

Primary models:

| Model / Concept | Purpose |
|---|---|
| Profile | Hero section data (name, role, intro, location, photo) |
| Contact | Contact section links |
| HeroLink | Hero CTA buttons |
| SkillCategory | About section skill lists |
| App (featured) | Featured apps section |
| Certificate (featured) | Featured certificates section |
| WorkExperience | Work experience section |

---

## Persistence

Source of truth:

`PostgreSQL`

Local/cache behavior:

No route-level cache. Data functions are wrapped with `React.cache()` for request deduplication.

Remote behavior:

Direct PostgreSQL queries via Prisma

Write rules:

- All writes via admin Server Actions
- `revalidatePath("/")` after any mutation

Read rules:

- `getPortfolio()` aggregates 7 queries via `Promise.all`
- Featured apps: `where: { featured: true }`, ordered by `sortOrder desc`, limit 3
- Featured certificates: `where: { featured: true }`, ordered by `issued desc`, limit 3 (falls back to latest 3)

---

## External Integrations

- `Canvas 2D` — Active embedded Pixel Fishing game (lazy-loaded)
- `Phaser 4.1` — Retained Pixel Fighter implementation (loaded only when selected)
- `JSON-LD` — WebSite and Person schema for SEO

---

## Failure and Edge Cases

| Case | Expected Behavior |
|---|---|
| Database unreachable | `error.tsx` catches and shows retry UI |
| No apps exist | Empty state (no featured apps section) |
| No certificates exist | Empty state (no certificates section) |
| No work experience | Empty state (no experience section) |
| Game fails to load | CSS idle preview remains visible |

---

## UI Ownership

Pages/screens:

- `src/app/page.tsx` — Homepage Server Component

Feature-owned components:

- `src/components/hero.tsx` — Hero section
- `src/components/section-shell.tsx` — Section wrapper
- `src/components/app-card.tsx` — App card
- `src/components/work-experience.tsx` — Experience section
- `src/components/about.tsx` — About/skills section
- `src/components/certificates.tsx` — Certificates section
- `src/components/contact.tsx` — Contact section

Shared components used:

- `src/components/scroll-reveal.tsx` — Scroll animations
- `src/components/ui/*` — shadcn primitives

---

## Testing Priorities

Prioritize:

- `getPortfolio()` returns all expected data
- Featured apps/certificates fallback logic
- Section rendering with empty data

---

## Known Limitations

- No pagination for sections
- HeroLink and DirectoryLink have no admin management UI

---

## Where to Change

| Change | Primary Location |
|---|---|
| Page layout | `src/app/page.tsx` |
| Hero section | `src/components/hero.tsx` |
| Section wrapper | `src/components/section-shell.tsx` |
| Data fetching | `src/data/db.ts` → `getPortfolio()` |
| SEO metadata | `src/app/layout.tsx` + `src/data/seo.ts` |

---

## Update Rules

Update this document when:

- Homepage sections change
- Data aggregation changes
- Featured display logic changes
- Hero section behavior changes
