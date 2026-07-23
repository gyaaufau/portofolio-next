# Next Steps After Restart

## 1. Run SQL via Supabase MCP

After restarting opencode, use the Supabase MCP to execute these two SQL files:

### Create tables
```
Execute scripts/supabase-tables.sql via Supabase MCP
```

### Seed data
```
Execute scripts/seed.sql via Supabase MCP
```

## 2. Verify Storage Buckets

Two buckets should already exist (created earlier):
- `portfolio` (public) — brand, certs, profile photo, CV
- `apps` (public) — app icons, screenshots

Files already uploaded via `scripts/upload-to-supabase.ts`.

## 3. Verify App Works

```bash
npm run dev
```

Check:
- Homepage loads with data from Supabase
- Admin panel at `/admin` works
- Images load from Supabase Storage URLs

## 4. Cleanup (optional)

Delete these temporary scripts:
- `scripts/create-buckets.ts`
- `scripts/cleanup-old-folders.ts`
- `scripts/run-sql.ts`
- `scripts/upload-to-supabase.ts`

## Summary of What's Done

- [x] Images converted to WebP (48.3% reduction)
- [x] Supabase client setup (server, client, middleware)
- [x] Storage helper (`storageUrl` + `appStorageUrl`)
- [x] `db.ts` rewritten (Prisma → Supabase)
- [x] `admin/actions.ts` rewritten
- [x] 11 admin pages rewritten
- [x] Layout + CV page updated
- [x] Config + env updated
- [x] Storage buckets created
- [x] Files uploaded to Supabase Storage
- [ ] SQL tables created (run via MCP after restart)
- [ ] SQL seed data inserted (run via MCP after restart)
- [ ] Verify app works
