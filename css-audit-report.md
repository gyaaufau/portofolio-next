# Custom CSS Classes Audit Report

## Summary
- **Total custom CSS classes defined in globals.css:** 16
- **Total lines:** 429
- **Files audited:** All `.tsx` components and pages under `src/`
- **All custom classes are defined in:** `src/app/globals.css`

---

## Custom Class Usage

| Class | Used In | Status |
|---|---|---|
| `text-pixel` | 29 files (components, pages, admin) | ✅ Active |
| `immersive-hero` | 2 files (`hero.tsx`, `hero-game-shell.tsx`) + game CSS | ✅ Active |
| `hero-game-shell` | 2 files (`hero.tsx`, `hero-game-shell.tsx`) + game CSS | ✅ Active |
| `pixel-button` | 11 files (components, pages, game adapter) | ✅ Active |
| `pixel-frame` | 13 files (components, pages) | ✅ Active |
| `immersive-hero-copy` | 2 files (`globals.css` media queries, `hero.tsx`) | ✅ Active |
| `prose-pixel` | 1 file (`blog/how-to-build-scalable-flutter-app-architecture/page.tsx`) | ✅ Active |
| `pixel-grid` | 7 files (components, pages) | ✅ Active |
| `site-navbar` | 2 files (`navbar.tsx`) | ✅ Active |
| `skip-link` | 1 file (`public-chrome.tsx`) | ✅ Active |
| `hero-enter` | 2 files (`globals.css` reduced-motion, `hero-game-shell.tsx`) | ✅ Active |
| `badge-pixel` | 2 files (`app-card.tsx`, `store-badge.tsx`) | ✅ Active |
| `hero-game-load-error` | 1 file (`globals.css` + game shell) | ✅ Active |
| `fight-notice` | 1 file (`globals.css` + game CSS) | ✅ Active |
| `fight-instructions` | 1 file (`globals.css` + game CSS) | ✅ Active |
| `hero-game-module-loading` | 1 file (`globals.css` + game shell) | ✅ Active |
| `hero-enter-delay` | Removed (was unused) | ❌ Removed |

---

## CSS Structure

### Theme Variables (lines 32-71)
- Light mode defaults in `:root`
- Dark mode via `@media (prefers-color-scheme: dark)`
- Dynamic accent via `--site-accent` (injected from `SiteSettings` DB row)

### Base Layer (lines 73-89)
- Tailwind `@layer base` with border, scroll, selection, focus, typography

### Pixel Art Design System (lines 91-158)
- `.skip-link` — Accessibility skip-to-content
- `.text-pixel` — Press Start 2P font styling
- `.pixel-frame` — Pixel-art card frame with shadow
- `.pixel-button` — Interactive pixel-art button
- `.badge-pixel` — Small pixel-art badge
- `.pixel-grid` — Subtle grid background pattern
- `.hero-enter` / `.hero-enter-delay` — Entrance animations

### Hero Game Shell (lines 160-416)
- CSS custom properties for iris effect (`--iris-radius`, `--iris-x`, `--iris-y`)
- `.hero-game-shell` — Game container with iris background
- `.hero-game-module-loading` — Loading state
- `.hero-game-load-error` — Error state
- `.immersive-hero` — Full-screen hero with game background
- `.immersive-hero-copy` — Hero text overlay
- `.fight-*` — Game-specific UI classes (notice, instructions, stage, HUD)
- Responsive breakpoints at 899px and 520px
- `prefers-reduced-motion` support

### Prose (lines 418-423)
- `.prose-pixel` — Blog article styling

### Media Queries
- `@media (prefers-color-scheme: dark)` — Dark mode variables
- `@media (max-width: 899px)` — Tablet/mobile hero adjustments
- `@media (max-width: 520px)` — Small mobile hero adjustments
- `@media (prefers-reduced-motion: reduce)` — Animation disable

### CSS Houdini
- `@property --iris-radius` — Custom property for iris effect
- `@property --iris-x` — Custom property for iris X position
- `@property --iris-y` — Custom property for iris Y position

---

## Key Findings

1. **All 17 custom classes are defined in `globals.css`** — No scattered CSS modules.

2. **All 16 classes are actively used** — No unused custom CSS classes.

3. **Game-specific CSS is minimal** — Most game styling lives in `src/games/pixel-fighter/pixel-fighter.css` (separate file).

4. **Heavy use of CSS custom properties** — All custom classes reference CSS variables for theming.

5. **Dark mode support** — Automatic via `prefers-color-scheme` media query.

6. **Responsive design** — Two breakpoints (899px, 520px) for hero section.

7. **Accessibility** — `prefers-reduced-motion` disables all animations; skip-link for keyboard navigation.

8. **Dynamic theming** — `--site-accent` injected from database via root layout style attribute.

---

## Unused Classes

None — all classes are actively used.

---

## Update Rules

Update this file when:

- New custom CSS classes are added to `globals.css`
- Classes are removed or renamed
- New components use custom classes
- Theme system changes
