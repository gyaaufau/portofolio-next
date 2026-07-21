# Hero Game

## Purpose

The hero game feature adds an interactive, playable pixel-art game to the homepage hero section. It showcases technical skill through game development while creating a memorable first impression for visitors.

---

## Ownership

This feature owns:

- Game registry (`src/games/registry.ts`)
- Game core shell (`src/games/core/hero-game-shell.tsx`)
- Game lifecycle management (`src/games/core/lifecycle.ts`)
- Game type definitions (`src/games/core/types.ts`)
- Pixel Fighter game (`src/games/pixel-fighter/`)
- Game CSS (`src/games/pixel-fighter/pixel-fighter.css`)
- Atlas build script (`scripts/build-fightgame-atlas.mjs`)

This feature does not own:

- Hero section layout (owned by `homepage`)
- Phaser engine (external dependency)

Related features:

- `homepage` — hosts the game in the hero section

---

## Entry Points

The feature can be entered from:

- Homepage hero section (game renders automatically)
- Direct URL `/game-preview` (reserved, currently empty)

Primary route(s):

```text
/ (homepage hero section — game embedded)
```

---

## User Flow

```text
Visitor lands on /
→ CSS idle preview loads immediately (no JS)
→ Hero game shell initializes
→ Phaser engine lazy-loaded when hero approaches viewport
→ Game renders in hero background
→ Desktop: controls shown below arena
→ Mobile (<768px): fullscreen arena with touch controls
→ Sound muted by default; visitor can enable
→ Game pauses when hero section leaves viewport
```

---

## State Lifecycle

State owner:

```text
Client Component (src/games/core/hero-game-shell.tsx)
```

Lifecycle:

```text
Page load
→ CSS idle preview visible
→ IntersectionObserver watches hero section
→ Hero approaches viewport → dynamic import Phaser adapter
→ Engine initializes → game renders
→ Hero leaves viewport → game pauses
→ Hero re-enters → game resumes
```

Important state rules:

- Game engine is lazy-loaded (dynamic import)
- Game pauses offscreen (visibility API)
- Sound muted until visitor enables
- Touch controls on mobile, keyboard on desktop

Long-lived state:

None — game state is transient, resets on page load.

---

## Data Flow

```text
src/games/registry.ts
→ ACTIVE_HERO_GAME_ID → "pixel-fighter"
→ getHeroGameDefinition() → HeroGameDefinition
→ src/games/core/hero-game-shell.tsx
→ dynamic import("./pixel-fighter/adapter")
→ Phaser engine initialization
→ Game runtime
```

Primary models:

| Model / Concept | Purpose |
|---|---|
| HeroGameDefinition | Game registration contract |
| HeroGameId | Type union of registered game IDs |
| HERO_GAMES | Registry of all available games |
| ACTIVE_HERO_GAME | Currently selected game |

---

## Persistence

Source of truth:

`None` — game state is client-side only

Write rules:

No persistence. Game resets on every page load.

Read rules:

Game assets loaded from `public/games/pixel-fighter/generated/`.

---

## External Integrations

- `Phaser 4.1` — Game engine (client-side only)
- `public/FIGHTGAME_Assets/` — Licensed source art pack
- `public/games/pixel-fighter/generated/` — Pre-built Phaser atlases

---

## Failure and Edge Cases

| Case | Expected Behavior |
|---|---|
| WebGL not supported | CSS idle preview remains visible |
| Phaser fails to load | Error message shown; CSS preview remains |
| Game crash | Error boundary catches; CSS preview remains |
| Mobile device | Fullscreen arena with touch controls |
| Desktop device | Inline arena with keyboard controls |
| Hero offscreen | Game pauses |
| Hero onscreen | Game resumes |

---

## UI Ownership

Pages/screens:

- `src/games/core/hero-game-shell.tsx` — Game container (Client Component)

Feature-owned components:

- `src/games/pixel-fighter/adapter.tsx` — Phaser adapter
- `src/games/pixel-fighter/domain/` — Game domain logic
- `src/games/pixel-fighter/engine/` — Phaser engine setup

---

## Testing Priorities

Prioritize:

- `validateHeroGameRegistry()` — registry integrity
- `selectHeroGame()` — game selection logic
- `ACTIVE_HERO_GAME_ID` — valid game ID
- Game registry has no duplicate IDs

---

## Known Limitations

- No fallback for browsers without WebGL
- `src/game/` directory exists but is empty (legacy)
- `game-preview` route exists but is empty
- Atlas build script requires manual run after art changes

---

## Where to Change

| Change | Primary Location |
|---|---|
| Game registry | `src/games/registry.ts` |
| Game shell | `src/games/core/hero-game-shell.tsx` |
| Game lifecycle | `src/games/core/lifecycle.ts` |
| Game types | `src/games/core/types.ts` |
| Pixel Fighter game | `src/games/pixel-fighter/` |
| Atlas generation | `scripts/build-fightgame-atlas.mjs` |
| Source art | `public/FIGHTGAME_Assets/` |
| Generated atlases | `public/games/pixel-fighter/generated/` |

---

## Feature-Specific Agent Rules

- Change `ACTIVE_HERO_GAME_ID` in `src/games/registry.ts` to select a different game
- Run `npm run game:atlas` after changing game art
- Source art files in `public/FIGHTGAME_Assets/` must remain untouched
- Game must be lazy-loaded (dynamic import) — never bundle with main JS

---

## Update Rules

Update this document when:

- New game is registered
- Game behavior changes
- Loading/lifecycle behavior changes
- Platform-specific controls change
