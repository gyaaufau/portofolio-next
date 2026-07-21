# Certificates

## Purpose

The certificates feature displays professional credentials, course completions, and conference attendance records. Visitors can browse all certificates or view individual certificate detail pages.

---

## Ownership

This feature owns:

- Certificate list page (`/certificates`)
- Certificate detail page (`/certificates/[slug]`)
- Certificate display component

This feature does not own:

- Admin certificate management (owned by `admin`)
- Featured certificates on homepage (owned by `homepage`)

Related features:

- `homepage` — displays featured certificates (top 3)
- `admin` — CRUD operations for certificates

---

## Entry Points

The feature can be entered from:

- Homepage "View all certificates" link
- Homepage featured certificate cards
- Navbar "Certificates" link
- Direct URL `/certificates` or `/certificates/[slug]`

Primary route(s):

```text
/certificates            → Certificate list
/certificates/[slug]     → Certificate detail
```

---

## User Flow

```text
Visitor clicks "Certificates" or "View all certificates"
→ /certificates list page
→ See all certificates (newest first)
→ Click certificate
→ /certificates/[slug] detail page
→ View issuer, date, summary, details, image
→ Navigate back to list or homepage
```

---

## State Lifecycle

State owner:

```text
Server Component (src/app/certificates/page.tsx, src/app/certificates/[slug]/page.tsx)
```

Lifecycle:

```text
Request
→ getCertificates() or getCertificateBySlug(id)
→ Prisma query
→ Render Server Component
→ HTML response
```

Important state rules:

- `force-dynamic` — fresh data on every request
- Route parameter named `[slug]` but uses certificate `id` for lookup

Long-lived state:

None — every request fetches fresh.

---

## Data Flow

```text
src/app/certificates/page.tsx
→ getCertificates() (src/data/db.ts)
→ prisma.certificate.findMany({ orderBy: issued desc })
→ mapCertificate() → CertificateItem[]

src/app/certificates/[slug]/page.tsx
→ getCertificateBySlug(id) (src/data/db.ts)
→ prisma.certificate.findUnique({ where: { id } })
→ mapCertificate() → CertificateItem | null
```

Primary models:

| Model / Concept | Purpose |
|---|---|
| Certificate | Professional credential or learning milestone |
| CertificateImage | Optional image for certificate |

---

## Persistence

Source of truth:

`PostgreSQL` via Prisma `Certificate` model

Write rules:

- All writes via admin Server Actions
- `revalidatePath("/certificates")` after mutations

Read rules:

- `getCertificates()` — all certificates, ordered by `issued desc`
- `getCertificateBySlug(id)` — single certificate by ID
- `getFeaturedCertificates()` — featured only, limit 3 (falls back to latest 3 if fewer than 3 featured)

---

## External Integrations

- `JSON-LD` — CollectionPage schema on `/certificates` list

---

## Failure and Edge Cases

| Case | Expected Behavior |
|---|---|
| No certificates exist | Empty state |
| Invalid slug/id | `notFound()` called, 404 page shown |
| Featured < 3 | Falls back to latest 3 certificates |
| No image | Certificate renders without image |

---

## UI Ownership

Pages/screens:

- `src/app/certificates/page.tsx` — List page
- `src/app/certificates/[slug]/page.tsx` — Detail page

Feature-owned components:

- `src/components/certificates.tsx` — Certificate list/grid
- `src/components/certificate-detail-view.tsx` — Certificate detail layout

Shared components used:

- `src/components/back-link.tsx` — Back navigation

---

## Testing Priorities

Prioritize:

- `getCertificates()` returns all certificates ordered
- `getCertificateBySlug()` returns null for invalid ID
- Featured fallback logic (featured < 3 → latest 3)

---

## Known Limitations

- No filtering by type or issuer
- Route parameter named `[slug]` but uses `id` — naming inconsistency

---

## Where to Change

| Change | Primary Location |
|---|---|
| List page | `src/app/certificates/page.tsx` |
| Detail page | `src/app/certificates/[slug]/page.tsx` |
| Certificate component | `src/components/certificates.tsx` |
| Detail view | `src/components/certificate-detail-view.tsx` |
| Data queries | `src/data/db.ts` |
| Types | `src/data/types.ts` |

---

## Update Rules

Update this document when:

- Certificate display behavior changes
- Featured logic changes
- Certificate model fields change
