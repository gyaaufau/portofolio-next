# Admin Panel

## Purpose

The admin panel provides a password-protected content management interface for portfolio data. The single admin can manage apps, certificates, work experience, profile, contact, skills, and site appearance.

---

## Ownership

This feature owns:

- Admin login page (`/admin/login`)
- Admin dashboard (`/admin/`)
- App CRUD (`/admin/apps`, `/admin/apps/[id]`, `/admin/apps/new`)
- Certificate CRUD (`/admin/certificates`, `/admin/certificates/[id]`, `/admin/certificates/new`)
- Work experience CRUD (`/admin/work-experience`, `/admin/work-experience/new`)
- Profile management (`/admin/profile`)
- Contact management (`/admin/contact`)
- Skills management (`/admin/skills`)
- Appearance management (`/admin/appearance`)
- All Server Actions for mutations (`src/app/admin/actions.ts`)

This feature does not own:

- Public display of portfolio data (owned by `homepage`, `apps`, `certificates`)
- Auth implementation details (owned by `jose-auth` integration)

Related features:

- `homepage` — displays data managed by admin
- `apps` — public display of admin-managed apps
- `certificates` — public display of admin-managed certificates

---

## Entry Points

The feature can be entered from:

- Direct URL `/admin/login`
- Admin sidebar navigation (after login)

Primary route(s):

```text
/admin/login                  → Login page
/admin/                       → Dashboard
/admin/apps                   → App list
/admin/apps/new               → Create app
/admin/apps/[id]              → Edit app
/admin/certificates           → Certificate list
/admin/certificates/new       → Create certificate
/admin/certificates/[id]      → Edit certificate
/admin/work-experience        → Work experience list
/admin/work-experience/new    → Create work experience
/admin/profile                → Profile form
/admin/contact                → Contact form
/admin/skills                 → Skills form
/admin/appearance             → Appearance form
```

---

## User Flow

```text
Admin visits /admin/login
→ Enter password
→ JWT cookie set (7-day expiry)
→ Redirect to /admin/ (dashboard)
→ Navigate via sidebar to any admin section
→ Fill form → Submit → Server Action → revalidatePath → Updated data
→ Logout → Cookie deleted → Redirect to /admin/login
```

---

## State Lifecycle

State owner:

```text
Server Actions (src/app/admin/actions.ts)
```

Lifecycle:

```text
Login:
  Password → passwordMatches() → createSessionToken() → JWT cookie

Mutations:
  FormData → requireAdmin() guard → Prisma write → revalidatePath()

Logout:
  → Delete cookie → Redirect to /admin/login
```

Important state rules:

- All mutations protected by `requireAdmin()` — redirects to login if invalid
- `requireAdmin()` verifies JWT cookie on every request
- Protected layout (`(protected)/layout.tsx`) calls `requireAdmin()` before rendering
- Middleware (`src/proxy.ts`) redirects unauthenticated requests from `/admin/*`

Long-lived state:

- JWT cookie persists for 7 days
- Database changes persist permanently

---

## Data Flow

```text
Admin Form
→ Server Action (src/app/admin/actions.ts)
→ requireAdmin() (src/lib/auth.ts)
→ Prisma write (src/lib/prisma.ts)
→ revalidatePath()
→ Next.js cache invalidation
→ Updated public page on next visit
```

Primary models:

| Model / Concept | Purpose |
|---|---|
| All portfolio models | CRUD via admin |
| JWT Session | Auth state in cookie |

---

## Persistence

Source of truth:

`PostgreSQL` for all content; JWT cookie for session

Write rules:

- All writes go through Server Actions in `src/app/admin/actions.ts`
- Every mutation calls `revalidatePath()` for affected public routes
- `updateSiteSettings()` uses `useActionState` for form state
- Slugs auto-generated from title (lowercase, hyphenated, alphanumeric only)

Read rules:

- Admin pages use `force-dynamic`
- Dashboard fetches counts via `prisma.*.count()`

---

## External Integrations

- `jose` — JWT creation and verification (see `docs/integrations/jose-auth.md`)

---

## Failure and Edge Cases

| Case | Expected Behavior |
|---|---|
| Invalid password | "Invalid password" error message |
| Expired JWT | Redirect to `/admin/login` |
| Missing env vars | Error thrown on first auth attempt |
| Duplicate slug | Prisma unique constraint error |
| Invalid JSON in sections | `parseSections()` catches and returns empty array (safe fallback) |

---

## UI Ownership

Pages/screens:

- `src/app/admin/login/page.tsx` — Login (Client Component)
- `src/app/admin/admin-shell.tsx` — Admin layout with sidebar
- `src/app/admin/(protected)/page.tsx` — Dashboard
- `src/app/admin/(protected)/apps/page.tsx` — App list
- `src/app/admin/(protected)/apps/new/page.tsx` — Create app
- `src/app/admin/(protected)/apps/[id]/page.tsx` — Edit app
- `src/app/admin/(protected)/apps/app-form.tsx` — App form
- `src/app/admin/(protected)/certificates/page.tsx` — Certificate list
- `src/app/admin/(protected)/certificates/new/page.tsx` — Create certificate
- `src/app/admin/(protected)/certificates/[id]/page.tsx` — Edit certificate
- `src/app/admin/(protected)/certificates/cert-form.tsx` — Certificate form
- `src/app/admin/(protected)/work-experience/page.tsx` — Experience list
- `src/app/admin/(protected)/profile/page.tsx` — Profile form
- `src/app/admin/(protected)/contact/page.tsx` — Contact form
- `src/app/admin/(protected)/skills/page.tsx` — Skills form
- `src/app/admin/(protected)/appearance/page.tsx` — Appearance form

---

## Testing Priorities

Prioritize:

- `passwordMatches()` — timing-safe comparison
- `createSessionToken()` / `verifySessionToken()` — JWT lifecycle
- `requireAdmin()` — redirects unauthenticated requests
- Server Action auth guard on every mutation

---

## Known Limitations

- Single admin model — no role system
- No CSRF protection beyond SameSite cookie
- No rate limiting on login
- No audit log for mutations
- HeroLink and DirectoryLink have no admin management UI
- No file upload UI — images uploaded to R2 via `scripts/migrate-to-r2.ts`, paths entered as text in admin forms

---

## Where to Change

| Change | Primary Location |
|---|---|
| Login page | `src/app/admin/login/page.tsx` |
| Admin shell | `src/app/admin/admin-shell.tsx` |
| Server Actions | `src/app/admin/actions.ts` |
| Auth logic | `src/lib/auth.ts` |
| Middleware | `src/proxy.ts` |
| App form | `src/app/admin/(protected)/apps/app-form.tsx` |
| Certificate form | `src/app/admin/(protected)/certificates/cert-form.tsx` |

---

## Feature-Specific Agent Rules

- Always call `requireAdmin()` before any mutation in Server Actions
- Use `revalidatePath()` after every write to invalidate public page cache
- Auto-generate slugs from title if not provided
- Parse arrays from FormData: comma-separated for stack, newline-separated for highlights/details

---

## Update Rules

Update this document when:

- New admin section is added
- Auth flow changes
- Server Action behavior changes
- Admin UI layout changes
