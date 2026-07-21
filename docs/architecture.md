# portofolio_next Architecture

This document describes the global architecture that exists in the project today.

Architecture mode:

```text
Next.js App Router portfolio with PostgreSQL backend
```

Feature behavior, detailed flows, and feature-specific limitations belong in `docs/features/*.md`.

---

## When to Read This Document

Read this file when a task touches:

- application bootstrap,
- app root,
- global dependency injection,
- core infrastructure,
- cross-feature dependency direction,
- global routing topology,
- app-wide state ownership,
- shared platform boundaries,
- large architecture changes.

For normal feature work, start with the owning feature document and relevant code.

---

## 1. Project Snapshot

**Application type:**
Web portfolio with admin CMS

**Architecture style:**
Next.js App Router with Server Components, Server Actions, and Prisma ORM

**Primary runtime:**
Next.js 16 / React 19 / TypeScript 5 / Node.js

**Core technologies:**

- Routing: Next.js App Router (file-based)
- State: Server-side via Prisma queries; no client state library
- Database: PostgreSQL via Prisma 7 with `@prisma/adapter-pg`
- Auth: `jose` JWT with HTTP-only cookies
- Styling: Tailwind CSS 4 + `class-variance-authority` + `tailwind-merge`
- UI Kit: shadcn/ui primitives (`Button`, `Card`, `Badge`, `Separator`)
- Game Engine: Phaser 4.1 (lazy-loaded, client-only)
- Fonts: Geist Sans (self-hosted) + Press Start 2P (pixel accent)
- SEO: JSON-LD structured data (WebSite, Person, FAQPage, CollectionPage)

**Current delivery stage:**
Production

---

## 2. Runtime and Bootstrap

Entry points:

```text
src/app/layout.tsx          → Root layout (server component)
src/app/page.tsx            → Homepage
src/app/admin/layout.tsx    → Admin root layout (passthrough)
src/app/admin/(protected)/layout.tsx → Protected admin layout (auth guard)
```

Startup flow:

```text
Next.js Server
→ Environment Variables (.env: DATABASE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET)
→ Prisma Client Singleton (src/lib/prisma.ts)
→ Root Layout (fetches SiteSettings for accent theme)
→ Page Component (Server Component fetches data via src/data/db.ts)
→ HTML Response
```

What startup owns:

- Prisma client initialization (singleton, globalThis cache in dev)
- SiteSettings fetch for accent color injection into root `<html>` style
- SEO metadata and JSON-LD schema injection

Blocking initialization:

- Prisma client creation on first request
- SiteSettings query in root layout

Non-blocking initialization:

- Phaser game engine (lazy-loaded via dynamic import when hero approaches viewport)
- ScrollReveal animations (client-side)

Environment values:

- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_PASSWORD` — Plain-text password for admin login
- `ADMIN_SESSION_SECRET` — 32+ character secret for JWT signing

---

## 3. App Root and Global Configuration

App root:

```text
src/app/layout.tsx
```

Global responsibilities:

- Theme: CSS custom property `--site-accent` injected into `<html>` style from `SiteSettings`
- Localization: `lang="en"` on `<html>`
- Fonts: `GeistSans.variable` class on `<html>`, Press Start 2P imported globally
- SEO: Metadata object, OpenGraph, Twitter cards, JSON-LD scripts
- Public chrome: `PublicChrome` component wraps children with `Navbar`, `Footer`, `ScrollReveal`
- Admin bypass: `PublicChrome` skips navbar/footer when path starts with `/admin`

---

## 4. Routing Topology

Routing system:

```text
Next.js App Router (file-based routing under src/app/)
```

Global route shape:

```text
App
├── / (Homepage)
├── /apps (App catalog)
├── /apps/[slug] (App detail)
├── /certificates (Certificate list)
├── /certificates/[slug] (Certificate detail)
├── /cv (CV viewer)
├── /blog (Blog)
├── /admin/login (Login page)
├── /admin/(protected)/ (Dashboard)
├── /admin/(protected)/apps (App management)
├── /admin/(protected)/certificates (Certificate management)
├── /admin/(protected)/work-experience (Work experience management)
├── /admin/(protected)/profile (Profile management)
├── /admin/(protected)/contact (Contact management)
├── /admin/(protected)/skills (Skills management)
├── /admin/(protected)/appearance (Theme/accent management)
└── /game-preview (Empty, reserved)
```

Redirects:

```text
/projects → /apps (permanent)
/projects/:slug → /apps/:slug (permanent)
```

Detailed route inventory belongs in `docs/navigation.md`.

---

## 5. Dependency Injection

DI system:

```text
None — Next.js Server Components fetch data directly; Prisma client is a global singleton
```

Registration order:

```text
Prisma Client Singleton (src/lib/prisma.ts)
→ Data Access Functions (src/data/db.ts)
→ Server Components / Server Actions (src/app/**)
```

Lifecycle rules:

| Dependency Type | Default Lifecycle |
|---|---|
| Prisma client | Singleton (globalThis cache in dev) |
| Data access functions | Module-level exports |
| Server Actions | Request-scoped |
| Auth session | Cookie-scoped (7-day expiry) |

---

## 6. Core Infrastructure

### Networking

- Client: `@prisma/client` with `@prisma/adapter-pg`
- Auth middleware: `src/proxy.ts` (session verification redirect)
- Environment config: `.env` file (dotenv)

### Persistence

Remote:

`PostgreSQL` (Neon-compatible via `@neondatabase/serverless`)

Local:

`None` — No local persistence; all data in PostgreSQL

Cache:

`Prisma globalThis singleton` in development; no production cache layer

### External Services

- `Phaser 4.1` — Client-side game engine for hero section
- `shadcn/ui` — UI component primitives

Detailed contracts belong in `docs/integrations/`.

---

## 7. Feature Architecture

Features live under:

```text
src/app/          → Route-level pages (Server Components)
src/components/   → Shared UI components
src/data/         → Data access layer (db.ts, types.ts, seo.ts)
src/lib/          → Shared utilities (prisma, auth, theme, utils)
src/games/        → Hero game engine
```

Default feature structure:

```text
feature/
  page.tsx              → Server Component (data fetching + layout)
  [slug]/page.tsx       → Dynamic route page
  components/           → Feature-specific components (if needed)
```

Shared components:

```text
src/components/
  hero.tsx              → Hero section
  navbar.tsx            → Navigation bar (client)
  footer.tsx            → Footer
  app-card.tsx          → App card component
  certificates.tsx      → Certificate list
  contact.tsx           → Contact section
  work-experience.tsx   → Work experience section
  about.tsx             → About section
  section-shell.tsx     → Section wrapper
  scroll-reveal.tsx     → Scroll animation (client)
  public-chrome.tsx     → Public layout wrapper (client)
  ui/                   → shadcn primitives
```

Layer responsibilities:

### Data (`src/data/`)

Owns app-facing types, Prisma query functions, and SEO configuration. No repository abstraction; functions call Prisma directly.

### Presentation (`src/app/`)

Owns route-level Server Components, metadata, and Server Actions. Pages fetch data via `src/data/db.ts` functions.

### Shared (`src/lib/`, `src/components/`)

Owns infrastructure (Prisma client, auth, theme) and reusable UI components.

Preferred dependency direction:

```text
Server Component / Server Action
→ Data Access Function (src/data/db.ts)
→ Prisma Client (src/lib/prisma.ts)
→ PostgreSQL
```

The default architecture intentionally avoids repository pattern, use cases, and dependency injection containers. Server Components call data functions directly.

---

## 8. Dependency Direction

Document the project-wide dependency flow.

```text
Server Component / Server Action
→ Data Access Layer (src/data/db.ts)
→ Prisma Client (src/lib/prisma.ts)
→ PostgreSQL
```

Cross-feature rules:

- Admin routes share data functions with public routes
- Admin Server Actions use `requireAdmin()` guard before mutations
- Public pages use `force-dynamic` to ensure fresh data on each request

Shared code rules:

- Promote to shared only after real reuse exists
- `src/lib/` contains infrastructure only (prisma, auth, theme, utils)
- `src/components/` contains UI components only
- `src/data/` contains data access only

---

## 9. Data Architecture

### Source-of-Truth Model

| Data | Source of Truth | Cache / Replica |
|---|---|---|
| Portfolio content (apps, certificates, work experience, profile, contact, skills) | PostgreSQL via Prisma | None |
| Site settings (accent color) | PostgreSQL via Prisma | None |
| Admin sessions | JWT in HTTP-only cookie | None |
| Static assets (images, CV, brand) | `public/data/` filesystem | None |

### Remote Data

All portfolio data lives in PostgreSQL. Prisma schema is the source of truth for structure. Seed data in `prisma/seed.ts`.

### Local Data

No local persistence. All data fetched from PostgreSQL on each request (`force-dynamic`).

### Synchronization

No sync strategy. Single PostgreSQL database is the sole source of truth.

Detailed schema and migrations belong in `docs/data/`.

---

## 10. State Ownership

State management system:

```text
Server-side only — no client state management library
```

Ownership rules:

- Portfolio data → PostgreSQL (Prisma)
- Page data → Fetched in Server Components via `src/data/db.ts`
- Admin auth → JWT cookie (jose)
- Theme accent → `SiteSettings` singleton in DB, injected into root layout
- Game state → Client-side Phaser engine (transient)

| Runtime Concept | Owner | Persistence |
|---|---|---|
| Portfolio data | PostgreSQL | Permanent |
| Admin session | JWT cookie | 7 days |
| Theme accent | SiteSettings DB row | Permanent |
| Game runtime | Phaser engine | Transient (client) |
| Scroll animations | ScrollReveal | Transient (client) |

Avoid multiple state owners for the same runtime concept.

---

## 11. Shared UI and Design System

Shared UI locations:

```text
src/components/          → Portfolio-specific components
src/components/ui/       → shadcn primitives (badge, button, card, separator)
src/app/globals.css      → Global styles, CSS variables, pixel-art design tokens
```

Shared primitives:

- `Button` — shadcn button with pixel-art styling
- `Card` — shadcn card
- `Badge` — shadcn badge
- `Separator` — shadcn separator
- `cn()` — `clsx` + `tailwind-merge` utility
- `SectionShell` — Reusable section wrapper with title/description
- `BackLink` — Navigation back link
- `AppCard` — App display card
- `ScrollReveal` — Intersection Observer animation trigger

Rules:

- Feature-specific components stay in feature scope first
- Promote only after real cross-feature reuse
- Shared components remain feature-agnostic

---

## 12. Error Handling

Failure flow:

```text
Database Error / Not Found
→ Next.js Error Boundary (error.tsx) / Not Found (not-found.tsx)
→ User Feedback (pixel-art styled error page)
```

Error pages:

- `src/app/error.tsx` — Global error boundary with retry button
- `src/app/not-found.tsx` — 404 page with pixel-art styling
- `src/app/loading.tsx` — Loading skeleton

Auth errors:

- Invalid session → Redirect to `/admin/login` via middleware (`src/proxy.ts`)
- Server Action auth → `requireAdmin()` redirects to login

---

## 13. Testing Strategy

Test ownership:

```text
tests/
  auth.test.ts        → Auth module tests
  game.test.ts        → Game registry tests
  hero-game.test.ts   → Hero game tests
  theme.test.ts       → Theme utility tests
```

Test runner: `tsx --test` (Node.js built-in test runner)

Prioritize:

- Auth token creation and verification
- Theme color resolution and contrast
- Game registry validation
- Hero game selection logic

Verification commands:

```bash
npm test
npm run lint
npm run build
npx prisma validate
```

---

## 14. Documentation Ownership

- `AGENTS.md` — Next.js agent rules
- `CONTEXT.md` — Shared domain terminology
- `docs/architecture.md` — Global architecture
- `docs/navigation.md` — Routes and cross-feature navigation
- `docs/features/*.md` — Feature behavior and ownership
- `docs/data/*.md` — Persistence and schema rules
- `docs/integrations/*.md` — External service contracts
- `docs/decisions/*.md` — Durable decisions and rationale
- `docs/archive/*` — Historical context only

---

## 15. Known Global Gaps

- No production caching layer (every request hits PostgreSQL)
- No image optimization pipeline (images served directly from `public/`)
- No CI/CD configuration in repository
- No production monitoring or error tracking
- Game engine has no fallback for browsers without WebGL
- `src/game/` directory exists but is empty (legacy)

---

## 16. Update Rules

Update this document when global architecture changes:

- bootstrap,
- app root,
- routing topology,
- DI strategy,
- feature boundaries,
- core infrastructure,
- data ownership,
- shared state ownership,
- global design-system ownership.

Do not update for:

- minor UI polish,
- copy changes,
- one-off bug fixes,
- feature-specific details,
- temporary experiments.
