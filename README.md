# Gialoop portfolio

A database-backed Next.js portfolio for Argya Aulia Fauzandika. The public site uses a restrained cozy-pixel visual system, while the admin area manages portfolio content and the global accent color.

## Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- PostgreSQL through Prisma 7
- Signed admin sessions with `jose`
- Static pixel city hero with light and dark artwork
- Self-hosted Geist and Press Start 2P fonts

## Local setup

Install dependencies:

```bash
npm install
```

Create `.env` with:

```dotenv
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="choose-a-strong-password"
ADMIN_SESSION_SECRET="use-at-least-32-random-characters"
```

Generate the Prisma client, apply migrations, and seed a new database:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

The public site is available at `http://localhost:3000`. The admin login is at `http://localhost:3000/admin/login`.

## Admin and appearance

Admin sessions use a signed, HTTP-only cookie that expires after seven days. Protected pages and every mutating Server Action verify the session.

The appearance editor in `/admin/settings` offers four warm CTA presets and a custom hex picker. The selected color is stored in `site_settings` and colors public-site CTA buttons. The CMS keeps its own ink, paper, red, yellow, and cobalt palette.

## Content

Portfolio records live in PostgreSQL. Images, app screenshots, certificate artwork, the CV, and brand assets live under `public/data`.

Legacy `/projects` URLs permanently redirect to `/apps`, including detail slugs.

## Homepage hero

The homepage uses a static pixel city scene with responsive light and dark artwork. Profile content and calls to action sit over the scene; no game engine is loaded.

## Verification

```bash
npm test
npm run lint
npm run build
npx prisma validate
```

The production build uses local font files and does not need to download Google Fonts.
