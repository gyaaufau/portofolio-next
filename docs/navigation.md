# Navigation

This document describes current route topology, route ownership, arguments/results, shell behavior, and cross-feature navigation flows.

Do not duplicate detailed feature behavior here.

---

## 1. Router Overview

Router:

```text
Next.js App Router (file-based routing)
```

Router location:

```text
src/app/
```

Global shape:

```text
App
├── / (Homepage — public)
├── /apps (App catalog — public)
├── /apps/[slug] (App detail — public)
├── /certificates (Certificate list — public)
├── /certificates/[slug] (Certificate detail — public)
├── /cv (CV viewer — public)
├── /blog (Blog — public)
├── /admin/login (Login — unauthenticated)
└── /admin/(protected)/ (Dashboard — authenticated)
    ├── apps (App management)
    ├── apps/[id] (Edit app)
    ├── apps/new (Create app)
    ├── certificates (Certificate management)
    ├── certificates/[id] (Edit certificate)
    ├── certificates/new (Create certificate)
    ├── work-experience (Work experience management)
    ├── work-experience/new (Create work experience)
    ├── profile (Profile management)
    ├── contact (Contact management)
    ├── skills (Skills management)
    └── appearance (Theme/accent management)
```

---

## 2. Route Registry

### Public Routes

| Route | Path | Owner Feature | Args | Result | Notes |
|---|---|---|---|---|---|
| Homepage | `/` | homepage | None | Portfolio data | Server Component, `force-dynamic` |
| App Catalog | `/apps` | apps | None | All apps | Server Component, `force-dynamic` |
| App Detail | `/apps/[slug]` | apps | `slug: string` | Single app | Server Component, `force-dynamic` |
| Certificate List | `/certificates` | certificates | None | All certificates | Server Component, `force-dynamic` |
| Certificate Detail | `/certificates/[slug]` | certificates | `slug: string` (certificate ID) | Single certificate | Server Component, `force-dynamic` |
| CV Viewer | `/cv` | cv | None | PDF/HTML | Static or server-rendered |
| Blog | `/blog` | blog | None | Blog content | Server Component |

### Admin Routes

| Route | Path | Owner Feature | Args | Result | Notes |
|---|---|---|---|---|---|
| Login | `/admin/login` | admin | None | Auth form | Client Component |
| Dashboard | `/admin/` | admin | None | Stats | Server Component, `requireAdmin()` |
| App List | `/admin/apps` | admin | None | All apps | Server Component, `requireAdmin()` |
| App Edit | `/admin/apps/[id]` | admin | `id: string` | Edit form | Server Component, `requireAdmin()` |
| App Create | `/admin/apps/new` | admin | None | Create form | Server Component, `requireAdmin()` |
| Certificate List | `/admin/certificates` | admin | None | All certificates | Server Component, `requireAdmin()` |
| Certificate Edit | `/admin/certificates/[id]` | admin | `id: string` | Edit form | Server Component, `requireAdmin()` |
| Certificate Create | `/admin/certificates/new` | admin | None | Create form | Server Component, `requireAdmin()` |
| Work Experience | `/admin/work-experience` | admin | None | All experiences | Server Component, `requireAdmin()` |
| Profile | `/admin/profile` | admin | None | Profile form | Server Component, `requireAdmin()` |
| Contact | `/admin/contact` | admin | None | Contact form | Server Component, `requireAdmin()` |
| Skills | `/admin/skills` | admin | None | Skills form | Server Component, `requireAdmin()` |
| Appearance | `/admin/appearance` | admin | None | Theme form | Server Component, `requireAdmin()` |

---

## 3. Route Arguments and Results

### `/apps/[slug]`

Arguments:

```text
slug: string (App.slug)
```

Result:

```text
AppItem | null (404 if not found)
```

Ownership:

`src/data/db.ts` → `getAppBySlug(slug)`

### `/certificates/[slug]`

Arguments:

```text
slug: string (Certificate.id)
```

Result:

```text
CertificateItem | null (404 if not found)
```

Ownership:

`src/data/db.ts` → `getCertificateBySlug(id)`

### `/admin/apps/[id]`

Arguments:

```text
id: string (App.id)
```

Result:

```text
App edit form (pre-populated)
```

Ownership:

Server Action `updateApp(id, formData)` in `src/app/admin/actions.ts`

### `/admin/certificates/[id]`

Arguments:

```text
id: string (Certificate.id)
```

Result:

```text
Certificate edit form (pre-populated)
```

Ownership:

Server Action `updateCertificate(id, formData)` in `src/app/admin/actions.ts`

---

## 4. Shells and Persistent UI

### Public Shell

`PublicChrome` (`src/components/public-chrome.tsx`) wraps all public pages:

- Skip-to-content link
- `Navbar` — Fixed top nav on homepage, sticky on subpages; bottom floating nav on mobile
- `Footer` — Site footer
- `ScrollReveal` — Intersection Observer animation trigger

Bypass: Pages under `/admin` skip `PublicChrome` entirely.

### Admin Shell

`AdminShell` (`src/app/admin/admin-shell.tsx`) wraps all protected admin pages:

- Sidebar navigation with all admin sections
- Logout button
- Main content area (max-w-4xl)

### Navbar Behavior

Desktop:

- Fixed on homepage (transparent over hero, solid when scrolled)
- Sticky on subpages (solid background)
- Active section detection via IntersectionObserver on homepage

Mobile:

- Fixed bottom floating nav with icon-only items
- Same active section detection

---

## 5. Cross-Feature Flows

### Public → Admin

```text
Public site
→ /admin/login (enter password)
→ JWT cookie set
→ /admin/ (dashboard)
```

Handoff:

Password verified via `passwordMatches()` (timing-safe comparison). JWT signed with `ADMIN_SESSION_SECRET`, stored in HTTP-only cookie.

Owner:

`src/lib/auth.ts` owns session creation/verification. `src/app/admin/actions.ts` owns login/logout Server Actions.

### Admin → Public

```text
Admin panel
→ Logout button
→ JWT cookie deleted
→ Redirect to /admin/login
```

### Projects → Apps (Legacy Redirect)

```text
/projects → /apps (permanent redirect)
/projects/:slug → /apps/:slug (permanent redirect)
```

Configured in `next.config.ts`.

---

## 6. Deep Links

| Deep Link | Destination | Preconditions |
|---|---|---|
| `/#top` | Hero section | Homepage only |
| `/#apps` | Apps section | Homepage only |
| `/#work-experience` | Work experience section | Homepage only |
| `/#about` | About section | Homepage only |
| `/#certificates` | Certificates section | Homepage only |
| `/#contact` | Contact section | Homepage only |
| `/apps/[slug]` | App detail | App must exist |
| `/certificates/[slug]` | Certificate detail | Certificate must exist |

---

## 7. Update Rules

Update this file when:

- a route is added or removed,
- route args/results change,
- shell topology changes,
- cross-feature navigation changes,
- deep-link behavior changes.
