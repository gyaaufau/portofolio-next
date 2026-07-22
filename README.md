# Gialoop portfolio

A database-backed Next.js portfolio for Argya Aulia Fauzandika. The public site uses a restrained cozy-pixel visual system, while the admin area manages portfolio content and the global accent color.

## Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- PostgreSQL through Prisma 7
- Signed admin sessions with `jose`
- Phaser 4.1 platform-fighter hero with generated pixel atlases
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

The Appearance screen offers four contrast-tested cozy accent presets and a custom hex picker. The selected accent is stored in the `SiteSettings` singleton and becomes the single accent token across light and dark modes.

## Content

Portfolio records live in PostgreSQL. Images, app screenshots, certificate artwork, the CV, and brand assets live under `public/data`.

Legacy `/projects` URLs permanently redirect to `/apps`, including detail slugs.

## Playable hero

The homepage uses a typed hero-game registry in `src/games/registry.ts`. Change `ACTIVE_HERO_GAME_ID` to select one registered game; visitors see only that curated game. Each game owns its engine, domain rules, UI, and runtime assets while the shared shell owns loading, fullscreen reveal, visibility, focus, and failure handling.

The pixel fighter uses the licensed source pack in `public/FIGHTGAME_Assets`. Original files and `ReadMePLS.txt` remain untouched. Compact Phaser atlases are committed under `public/games/pixel-fighter/generated` so deployments do not process the source art. Curated CC0 battle sounds and their provenance are committed under `public/games/pixel-fighter/audio`.

Regenerate the derived atlases after changing game art:

```bash
npm run game:atlas
```

The CSS idle preview loads before Phaser, then the complete engine is imported only as the hero approaches the viewport. Pressing Enter Battle fades the preview fighter and expands the circular aperture to reveal a centered 3:2 arena. Screens below 768px keep fullscreen HUD and multi-touch controls around a letterboxed arena. The Play interaction enables sound, and visitors can mute it during the match.

## Verification

```bash
npm test
npm run lint
npm run build
npx prisma validate
```

The production build uses local font files and does not need to download Google Fonts.
