# Portfolio CMS

The password-protected CMS uses the Paper design at desktop and phone widths. Its styles live in `src/app/admin/cms.css` and are scoped to admin pages.

## Routes

| Route | Purpose |
|---|---|
| `/admin/login` | Password sign-in |
| `/admin` | Overview and batch publish |
| `/admin/content` | Searchable app, note, certificate, and experience library |
| `/admin/content/apps/[id]` | App draft and publish editor |
| `/admin/content/notes/[id]` | Note draft and publish editor |
| `/admin/content/lists` | Experience, skills, and certificate entry points |
| `/admin/sections` | Section order, visibility, and copy drafts |
| `/admin/media` | Existing storage assets and image upload |
| `/admin/settings` | Profile, contact, and appearance entry points |

Existing detailed CRUD pages remain reachable from the CMS. The admin shell has a desktop sidebar, a phone drawer, and phone bottom navigation.

## Storage and publishing

Apply `scripts/2026-09-27-cms-redesign.sql` after the existing Supabase schema. The migration adds `cms_draft`, `cms_note`, `cms_section`, `cms_media`, publication status on existing content, and an atomic app publish function. The rollback script is beside it.

Saving a draft writes only to `cms_draft`; existing published records stay intact. Publishing an app writes the record and its screenshots in a database transaction. Batch publish removes each draft only after its publish succeeds and reports failures on the dashboard. Public app, certificate, and experience reads require `publication_status = 'published'`.

Notes and section configuration are CMS-only at present. Publishing them stores their CMS record without changing the public pages. Uploaded images use the existing `apps` and `portfolio` Supabase storage buckets and are indexed in `cms_media`.

## Security and verification

`src/app/admin/(protected)/layout.tsx` guards CMS pages with `requireAdmin()`. Server actions in `cms-actions.ts` and the media upload route check the same signed admin session before writing.

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. The CMS tests cover content status, draft retention during batch publish, media validation, and public draft filters. Live publish and upload verification requires applying the migration to the configured Supabase database.
