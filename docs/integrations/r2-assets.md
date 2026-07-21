# R2 Asset Storage

This document defines the boundary between the application and Cloudflare R2 object storage for static assets.

---

## Purpose

Cloudflare R2 stores all portfolio images, PDFs, and brand assets. It replaces direct serving from `public/data/` with CDN-backed object storage. Assets are uploaded via S3-compatible API and served through a public URL.

---

## Ownership Boundary

Application owns:

- R2 client configuration (`src/lib/r2.ts`)
- URL helper (`r2Url()`)
- Upload script (`scripts/migrate-to-r2.ts`)
- Asset path references in database (Prisma models)
- Hardcoded asset paths in components (`layout.tsx`, `cv/page.tsx`, `admin/actions.ts`)

External system owns:

- Object storage (Cloudflare R2)
- File persistence and availability
- S3-compatible API endpoint

Do not duplicate ownership across both sides.

---

## Configuration

Environment values:

```text
R2_ENDPOINT          — S3-compatible API endpoint (https://<account>.r2.cloudflarestorage.com)
R2_BUCKET            — Bucket name (e.g., "portofolio")
R2_PUBLIC_URL        — Public access URL for serving files (e.g., https://pub-xxx.r2.dev)
R2_ACCESS_KEY_ID     — S3 access key for authentication
R2_SECRET_ACCESS_KEY — S3 secret key for authentication
```

Source:

`.env` file (development) or environment variables (production)

Never commit secret values.

---

## Runtime Flow

### Rendering (read)

```text
Server Component
→ Data function returns path (e.g., "/data/myself/me.jpg")
→ r2Url(path) converts to full URL (e.g., "https://pub-xxx.r2.dev/data/myself/me.jpg")
→ next/image <Image src={fullUrl} />
→ Browser fetches from R2 public URL
```

### Upload (write)

```text
scripts/migrate-to-r2.ts
→ Walks public/data/ (excluding .md files and game assets)
→ Uploads each file to R2 via S3 PutObjectCommand
→ Skips files already in bucket (checks via ListObjectsV2Command)
```

---

## r2Url() Helper

Location: `src/lib/r2.ts`

Behavior:

- Input: local path (e.g., `/data/myself/me.jpg`)
- Output: full R2 URL (e.g., `https://pub-xxx.r2.dev/data/myself/me.jpg`)
- Fallback: returns original path if `R2_PUBLIC_URL` is not configured

Used by:

- `prisma/seed.ts` — all asset paths
- `src/app/layout.tsx` — OG image, favicon
- `src/app/cv/page.tsx` — CV PDF link
- `src/app/admin/actions.ts` — fallback paths for new apps/profile

---

## next/image Integration

`next.config.ts` configures `images.remotePatterns` to allow the R2 public URL domain:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "pub-4872022002ac4f7da49af5bd4bb1f721.r2.dev",
    },
  ],
},
```

If the R2 public URL changes, update both `R2_PUBLIC_URL` env var and `remotePatterns`.

---

## Asset Inventory

Non-game assets in R2:

| Category | Files | Key Pattern |
|---|---|---|
| Brand | logo.svg, logo.png, og-image.png, etc. | `data/brand/*` |
| Profile | me.jpg, CV.pdf | `data/myself/*` |
| Certificates | 3 certificate JPGs | `data/certifications/*/certificate.jpg` |
| Project logos | 4 app icons | `data/project/*/logo/*` |
| Project screenshots | 36 screenshots | `data/project/*/screenshots/*` |

Excluded:

- `.md` files (served from `public/data/` or read server-side)
- Game assets (`public/FIGHTGAME_Assets/`) — handled separately
- Root SVGs (`next.svg`, `vercel.svg`) — unused Next.js defaults

---

## CDN Status

Current: `r2.dev` public URL. May be blocked in some countries.

Pending: CDN proxy solution (Cloudflare Worker or custom domain) to bypass network-level blocks.

---

## Testing

Verify R2 is configured:

```bash
npx tsx -e "require('dotenv/config'); const { isR2Configured } = require('./src/lib/r2'); console.log(isR2Configured());"
```

Verify URL conversion:

```bash
npx tsx -e "require('dotenv/config'); const { r2Url } = require('./src/lib/r2'); console.log(r2Url('/data/myself/me.jpg'));"
```

Upload assets:

```bash
npx tsx scripts/migrate-to-r2.ts
```

---

## Known Limitations

- `r2.dev` public URL may be blocked in some countries (CDN proxy pending)
- No image optimization pipeline (images served as-is from R2)
- No automatic upload on deploy (manual `npx tsx scripts/migrate-to-r2.ts`)
- No file upload UI in admin panel (paths entered as text)
- No cache invalidation on R2 (files are immutable once uploaded)
- Game assets not yet migrated to R2

---

## Update Rules

Update when:

- R2 bucket or endpoint changes
- CDN proxy is implemented
- Asset upload flow changes
- Game assets are migrated to R2
- Admin panel gets file upload UI
