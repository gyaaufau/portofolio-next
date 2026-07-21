# ADR-001: Next.js App Router for Portfolio

- **Status:** Accepted
- **Date:** 2026-01-01
- **Decision Owners:** Argya Aulia Fauzandika

---

## Context

The portfolio was originally built with Flutter for web. The developer (Argya) is a Flutter specialist who builds mobile apps professionally. The portfolio needs to:

- Showcase Flutter projects with screenshots and detailed descriptions
- Provide an admin panel for content management
- Be performant and SEO-friendly
- Include an interactive hero section (playable game)
- Be easy to maintain and deploy

Constraints:

- Developer's primary expertise is Flutter/Dart
- Portfolio is a web application (not mobile)
- SEO is important for recruiter visibility
- Budget is minimal (no expensive hosting)
- Content changes frequently (needs CMS)

---

## Decision

We will use Next.js 16 App Router with TypeScript, React 19, Prisma 7 + PostgreSQL, and Tailwind CSS 4 for the portfolio.

---

## Rationale

- **SEO:** Next.js Server Components render HTML on the server, making content crawlable without client-side JavaScript
- **Performance:** Server Components reduce client-side JavaScript bundle; images and game assets lazy-loaded
- **Admin CMS:** Server Actions enable form mutations without separate API routes
- **Database:** Prisma provides type-safe queries and schema management
- **Deployment:** Vercel (or similar) supports Next.js with zero-config deployment
- **Cost:** PostgreSQL (Neon free tier) + Vercel free tier = minimal hosting cost

---

## Alternatives Considered

### Option A: Flutter Web

Pros:

- Developer's primary expertise
- Single codebase for web and mobile
- Familiar widget system

Cons:

- Poor SEO (client-side rendering)
- Large JavaScript bundle (~2MB+)
- No Server Components equivalent
- Harder to integrate with backend (requires API layer)
- Flutter web performance is suboptimal for portfolio use case

Why not chosen:

SEO is critical for a developer portfolio. Flutter web renders entirely client-side, making content invisible to search engines without significant workarounds.

### Option B: Static Site Generator (Astro, Hugo, 11ty)

Pros:

- Excellent SEO (pre-rendered HTML)
- Fast performance
- Simple deployment

Cons:

- No admin panel (requires separate CMS)
- No interactive hero game (requires client-side JS)
- Content changes require rebuilds
- No database integration

Why not chosen:

The portfolio needs an admin panel for content management and an interactive Phaser game in the hero section. Static generators don't support these use cases well.

### Option C: Full-Stack Framework (Nuxt, SvelteKit)

Pros:

- Server-side rendering
- Good SEO
- Full-stack capabilities

Cons:

- Smaller ecosystem than Next.js
- Less community support
- Developer less familiar with Vue/Svelte

Why not chosen:

Next.js has the largest ecosystem, best TypeScript support, and most community resources. The developer's transferable skills (TypeScript, React patterns) make Next.js the pragmatic choice.

---

## Consequences

Positive:

- SEO-friendly portfolio visible to search engines
- Admin panel for easy content management
- Type-safe database queries with Prisma
- Interactive hero game with Phaser
- Minimal hosting costs
- Fast page loads with Server Components

Negative:

- Developer must learn Next.js/React (new skill)
- Two technology stacks to maintain (Flutter for apps, Next.js for portfolio)
- Prisma schema must stay in sync with TypeScript types
- Server Components require different mental model than Flutter widgets

Follow-up:

- Document Next.js patterns in `AGENTS.md`
- Create feature docs for each portfolio section
- Set up CI/CD for automated deployment
- Monitor performance and SEO metrics

---

## Revisit Trigger

Revisit this decision when:

- Flutter web SEO support improves significantly
- Portfolio needs to serve as a mobile app (PWA insufficient)
- Developer's primary technology stack changes
- Hosting costs become a concern (switch to static generation)
