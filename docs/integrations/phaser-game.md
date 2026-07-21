# Phaser Game Engine Integration

This document defines the boundary between the application and the Phaser 4.1 game engine for the hero section playable game.

---

## Purpose

Phaser provides a 2D game engine for rendering interactive pixel-art games in the hero section. It handles game loop, physics, sprite rendering, input handling, and audio.

---

## Ownership Boundary

Application owns:

- Game registry (`src/games/registry.ts`)
- Game shell and lifecycle (`src/games/core/`)
- Game adapter (`src/games/pixel-fighter/adapter.tsx`)
- Game domain logic (`src/games/pixel-fighter/domain/`)
- Game CSS (`src/games/pixel-fighter/pixel-fighter.css`)
- Atlas generation script (`scripts/build-fightgame-atlas.mjs`)
- Source art assets (`public/FIGHTGAME_Assets/`)
- Generated atlases (`public/games/pixel-fighter/generated/`)

External system owns:

- Game engine runtime (Phaser 4.1)
- Rendering pipeline
- Physics engine
- Audio system
- Input handling

Do not duplicate ownership across both sides.

---

## Configuration

Environment values:

```text
None — Phaser runs entirely client-side, no server config needed
```

Source:

npm dependency: `"phaser": "4.1.0"`

---

## Runtime Flow

```text
Homepage loads
→ HeroGameShell mounts (Client Component)
→ IntersectionObserver watches hero visibility
→ Hero approaches viewport → dynamic import("./pixel-fighter/adapter")
→ Adapter initializes Phaser.Game with config
→ Game loop starts
→ Hero leaves viewport → game.pause()
→ Hero enters viewport → game.resume()
```

---

## Request Contract

Inputs:

- Phaser configuration (game config object)
- DOM container element
- Asset URLs (atlases, sprites)

---

## Response Contract

Success:

- Phaser.Game instance created
- Game renders in hero background
- Input handling active

Failure:

- WebGL not supported → CSS idle preview shown
- Phaser fails to load → error message, CSS preview remains
- Game crash → error boundary catches, CSS preview remains

Retry:

No automatic retry. CSS idle preview is the fallback.

---

## Asset Pipeline

Source art:

```text
public/FIGHTGAME_Assets/ReadMePLS.txt (license)
public/FIGHTGAME_Assets/**/*.png (original sprites)
```

Generated atlases:

```text
public/games/pixel-fighter/generated/*.json (Phaser atlas JSON)
public/games/pixel-fighter/generated/*.png (packed sprite sheets)
```

Build command:

```bash
npm run game:atlas
```

Runs: `node scripts/build-fightgame-atlas.mjs`

---

## Platform Behavior

Desktop (>=768px):

- Inline arena in hero background
- Keyboard controls
- Controls shown below arena

Mobile (<768px):

- Fullscreen arena
- Multi-touch controls
- Touch-based input

---

## Security Boundary

Application may know:

- Game configuration
- Asset URLs
- Platform detection

Application must not know:

- Phaser internal state
- WebGL context details

Client owns:

- Game rendering
- Physics simulation
- Audio playback
- Input processing

---

## Testing

Local:

- Visit homepage
- Verify game renders in hero section
- Test keyboard controls (desktop)
- Test touch controls (mobile)
- Verify game pauses when scrolling away

Production smoke test:

- Homepage loads with game visible
- Game responds to input
- Mobile layout works correctly

---

## Known Limitations

- No fallback for browsers without WebGL
- Game assets add ~2MB to page load (lazy-loaded)
- Atlas generation requires manual run after art changes
- No multiplayer or server-side game state
- `src/game/` directory exists but is empty (legacy)
- `game-preview` route exists but is empty

---

## Update Rules

Update when:

- Phaser version changes
- Game configuration changes
- Asset pipeline changes
- Platform behavior changes
- New game is registered
