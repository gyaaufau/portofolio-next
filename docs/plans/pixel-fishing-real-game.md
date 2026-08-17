# Pixel Fishing → Real Fishing Game (Immersive)

**Status:** approved direction, awaiting implementation
**Date:** 2026-07-25
**Scope:** Turn `pixel-fishing` from a decorative single-screen mini-game into a real
fishing game (walk, row a boat, zone-based catches) with an immersive circular-aperture
entrance identical in feel to Pixel Duel, using the CraftPix fishing asset pack.

---

## 1. Locked Decisions

| Decision | Choice | Notes |
|---|---|---|
| Asset pack | CraftPix free fishing pack (`public/assets/games/craftpix-net-258377-...`) | Keep raw pack **untouched** as source archive (same pattern as `FIGHTGAME_Assets`) |
| Curated assets | **Copy** (not move) into `public/assets/games/fishing/` with clean kebab-case names | Raw pack can later be removed from `public/` so PSDs don't deploy |
| Presentation | `embedded` → **`immersive`** with iris/circle reveal (like pixel-fighter) | Registry + adapter + CSS work |
| Sound | none | Pack has no audio; registry keeps `sound: false` |
| Persistence | session-only haul display, **no saves** | Boundary doc updated accordingly |
| Canvas | 320×180 → **480×270** logical (same 16:9) | Room for hut + pier + lake |
| Game CSS | convert `pixel-fishing.module.css` → plain `pixel-fishing.css` | Matches fighter/artillery/garden convention; global shell classes need plain CSS |
| Palette | regrade scene to the pack's warm sunset palette | Matches `Fishing_hut.png` |

### Open questions (non-blocking)
1. Switch the site hero game from `pixel-fighter` to `pixel-fishing` when done?
   - Selection is `SiteSettings.heroGameId` (DB) with `ACTIVE_HERO_GAME_ID` fallback in
     `src/games/registry.ts`. Either flip the constant or set it in admin/appearance.
2. Fish names (draft below) — adjustable anytime.

---

## 2. Asset Pack Analysis (verified visually + via `sips`)

### 2.1 Fisherman — main character (all sheets 48px-tall frames)
| File | Size | Frames | Content |
|---|---|---|---|
| `Fisherman_idle.png` | 192×48 | 4 | standing, rod on shoulder |
| `Fisherman_walk.png` | 288×48 | 6 | walking |
| `Fisherman_fish.png` | 192×48 | 4 | rod extended, fishing loop |
| `Fisherman_hook.png` | 288×48 | 6 | cast swing, bobber visible |
| `Fisherman_row.png` | 192×48 | 4 | rowing oars |
| `Fisherman_attack.png` | 288×48 | 6 | *(skipped — not cozy)* |
| `Fisherman_hurt.png` | 96×48 | 2 | *(skipped)* |
| `Fisherman_death.png` | 288×48 | 6 | *(skipped)* |

### 2.2 Alt characters (skipped for v1, stay in pack)
GraveRobber / SteamMan / Woodcutter × (fish 4f, hook 6f, row 4f) — same skeleton/timing
→ future skin system if wanted.

### 2.3 Objects
| Asset | Size | Use |
|---|---|---|
| `Water.png` | 96×96 | 3×3 grid of 32×32: 3-frame animated surface + foam/edge tiles |
| `Pier_Tiles.png` | 128×128 | modular planks/posts/rails tileset |
| `Fishing_hut.png` | 192×122 | stilt hut, scene anchor |
| `Boat.png` | 74×18 | side-view rowboat (Boat2 top-down = skipped) |
| `Grass1–4.png` | 19–38px | shore reeds/cattails |
| `Stay.png` | 29×15 | red buoy markers |
| `Fish-rod.png` | 16×26 | *(skipped v1)* |
| `Fishbarrel1–4.png` | 16×11 → 22×25 | fill-level progression → session haul meter |

### 2.4 Catch sprites (`3 Objects/Catch/`)
8 species of escalating size (rarity baked into art) + junk/treasure:
`1` tiny green 24×6 · `2` yellow 32×12 · `3` brown 40×12 · `4` silver-blue 52×12 ·
`5` red crab 56×24 · `6` blue shark 108×22 (2 swim frames) · `7` gray pike 60×12 (2f) ·
`8` pink bream 60×12 (2f) · `Barrel` 12×14 · `Box` 12×10 · `Chest` 22×12

### 2.5 Icons (skipped for v1)
20× 32×32 UI icons (rods, portrait, fish, buckets). v1 catch card draws the real catch
sprite instead. Keep in pack for a future codex UI.

### 2.6 Other
- `License.txt` → CraftPix free license (use allowed, no asset resale). Keep in pack.
- `Font.txt` → Pixellari — **not needed** (project ships Press Start 2P).
- `PSD/` — must not be deployed; stays in pack only.

---

## 3. Phase 1 — Asset Curation (exact copy list)

Create `public/assets/games/fishing/` (dir already exists, empty) with:

```
public/assets/games/fishing/
├── characters/
│   ├── fisherman-idle.png     ← "1 Fisherman/Fisherman_idle.png"
│   ├── fisherman-walk.png     ← "1 Fisherman/Fisherman_walk.png"
│   ├── fisherman-fish.png     ← "1 Fisherman/Fisherman_fish.png"
│   ├── fisherman-hook.png     ← "1 Fisherman/Fisherman_hook.png"
│   └── fisherman-row.png      ← "1 Fisherman/Fisherman_row.png"
├── environment/
│   ├── water.png              ← "3 Objects/Water.png"
│   ├── pier-tiles.png         ← "3 Objects/Pier_Tiles.png"
│   ├── fishing-hut.png        ← "3 Objects/Fishing_hut.png"
│   ├── boat.png               ← "3 Objects/Boat.png"
│   ├── grass-1.png … grass-4.png ← "3 Objects/Grass1..4.png"
│   └── buoys.png              ← "3 Objects/Stay.png"
├── catch/
│   ├── fish-1.png … fish-8.png   ← "3 Objects/Catch/1..8.png"
│   ├── junk-barrel.png        ← "3 Objects/Catch/Barrel.png"
│   ├── junk-box.png           ← "3 Objects/Catch/Box.png"
│   └── treasure-chest.png     ← "3 Objects/Catch/Chest.png"
└── props/
    └── fishbarrel-1.png … fishbarrel-4.png ← "3 Objects/Fishbarrel1..4.png"
```

**26 files**, all small PNGs. `cp` (not `mv`) — pack stays complete.

---

## 4. Game Design

### 4.1 Scene & world layout (480×270 logical px, single fixed screen)

```
x: 0────────130────────210────────330────────480
y=0    sky (sunset gradient, sun, drifting clouds)
y≈95   distant hills silhouette
y=150  ── horizon / water line ──────────────────
       [HUT on stilts]   pier planks →  ~buoys~      open lake
       shore wedge x<130   walk zone x∈[36,204]
                          boat docked x≈218, row zone x∈[140,444]
y=270  lake bed (dark gradient)
```

- Sky: 5-band warm gradient (amber → dusty rose → plum), pixel sun + glow, 2 drifting
  cloud strips (paused under reduced motion).
- Hills: procedural silhouette, recolored to pack dusk tones.
- Water: animated 3-frame surface tile row along the horizon + darker depth gradient
  below + slow highlight streaks.
- Shore: left wedge under the hut with `grass-1..4` tufts.
- Pier: plank row + posts from `pier-tiles.png`, top at y≈168.
- Buoys: 2 red markers bobbing ±1px mid-lake.
- Boat: side-view `boat.png`, gentle bob, moored at pier end until boarded.

### 4.2 Player modes & controls

| Mode | Enter | Move | Action button |
|---|---|---|---|
| **On pier** | start / disembark | ← → walk (`fisherman-walk`, 28 px/s, x∈[36,204]) | "Board boat" (near boat) or "Cast line" |
| **In boat** | action near moored boat | ← → row (`fisherman-row`, 34 px/s, x∈[140,444]) | "Go ashore" (near pier) or "Cast line" |
| **Fishing** | cast while stationary | — (movement locked) | Hook! / hold-to-reel / release |

- Keyboard: `ArrowLeft/Right` or `A/D` (hold), `Space/Enter` = action, `Esc` = exit.
- Touch: on-screen ◀ ▶ hold-buttons (pointer capture, like current reel button) +
  one contextual action button. No canvas touch capture (scroll-safe).
- Board rule: on pier, |playerX − 218| < 28. Disembark rule: boatX < 240.
- Cast rule: only when stationary (activity = idle).

### 4.3 Fishing loop (proven mechanics kept)

```
idle → casting(600ms) → waiting(1.5–4s) → fishBiting(1s window)
     → reeling(hold=+progress/+tension, release=−tension) → landed → idle
```

- Progress 28/s while held; tension starts 20, +38/s held, −48/s released.
- 100 progress = catch; 100 tension or 12s reel = escape.
- **Hooked catch is rolled at bite time** from the zone table (`chooseCatch(zone, random)`,
  pure + injectable random for tests).
- Visuals: bobber dip + pixel "!" on bite; fish shadows (real catch sprites, α≈0.35)
  cruise during waiting; catch leaps from water on success; junk/chest flop for misses.

### 4.4 Catch catalog & zones

Zones by cast position: **shore** (pier, x<210) · **mid** (boat, 210–330) · **deep** (boat, x>330).

| id | name | sprite | size | tension × | zones (weight) |
|---|---|---|---|---|---|
| pond-minnow | Pond Minnow | fish-1 | tiny | 0.8 | shore 30 |
| sunny-perch | Sunny Perch | fish-2 | small | 0.9 | shore 25, mid 15 |
| copper-salmon | Copper Salmon | fish-3 | small | 0.9 | shore 20, mid 15 |
| silver-dace | Silver Dace | fish-4 | medium | 1.0 | mid 25, deep 15 |
| red-crab | Red Crab | fish-5 | medium | 1.0 | shore 5, mid 10 |
| reed-pike | Reed Pike | fish-7 | large | 1.15 | mid 20, deep 25 |
| rosy-bream | Rosy Bream | fish-8 | large | 1.15 | deep 25 |
| lake-shark | Lake Shark | fish-6 | huge | 1.3 | deep 8 |
| junk-barrel | Old Barrel | junk-barrel | junk | 1.0 | shore 12, mid 8 |
| junk-box | Soggy Crate | junk-box | junk | 1.0 | shore 8, mid 7 |
| treasure-chest | Sunken Chest | treasure-chest | treasure | 1.2 | deep 2 |

(Weights per zone, normalized at roll time. Deep = best fish; shore = junk-prone.)

### 4.5 Session haul
- HUD barrel icon fills `fishbarrel-1 → -4` by haul count (0 / 1–2 / 3–5 / 6+).
- Catch card: caught sprite (rendered pixelated ×2) + name + flavor line.
- Haul list capped at 12 entries; cleared on exit/reset. **No persistence.**

---

## 5. Immersive Entrance (iris / circle animation)

Mirrors pixel-fighter's choreography exactly; reuses the **existing global system**:

- `@property --iris-radius/--iris-x/--iris-y` already registered in `globals.css`.
- Shell (`hero-game-shell.tsx`) already drives phases, `--hero-game-reveal-duration`,
  `is-revealing/is-active/is-exiting` classes, `body.hero-game-open` (scroll lock,
  navbar/copy fade), and `[data-presentation="immersive"].is-active` → fixed fullscreen.
- **No changes to `globals.css` or the shell.** Game-specific iris position overrides
  hang off the shell's `data-hero-game-id="pixel-fishing"` attribute inside
  `pixel-fishing.css`.

### 5.1 Fishing iris elements (in adapter, styled by `pixel-fishing.css`)
1. `.fishing-scrim` — dark pixel-grid overlay, radial-gradient mask hole at the iris
   (same mask technique as `.fight-scrim`).
2. `.fishing-aperture-ring` — 2px accent ring + glow at the iris edge.
3. `.fishing-transition-angler` — the fisherman (CSS sprite: `fisherman-idle.png` as
   background, `steps()` breathing anim) stands inside the iris during preview; on
   reveal he slides to his pier position and fades out (same trick as
   `.fight-transition-fighter`).
4. Play button "Start fishing" anchored under the iris
   (`top: calc(var(--iris-y) + var(--iris-radius) - 1.2rem)`).

### 5.2 Phase choreography
| Phase | What happens |
|---|---|
| preview | live canvas scene in hero bg; scrim on; iris frames the angler on the pier; button under iris |
| play → revealing (650ms) | iris expands `clamp(80px,13vw,96px)` → `120vmax` at center; angler element glides to pier spot; canvas cross-fades in `steps(3,end)`; scrim+ring fade |
| active | shell is fixed 100vw×100dvh; HUD + touch controls visible |
| exiting (650ms) | iris shrinks back to preview spot; HUD fades; shell returns to hero |

- Iris home position for fishing ≈ `--iris-x: 30%; --iris-y: 62%` (the pier spot),
  overridden via `.hero-game-shell[data-hero-game-id="pixel-fishing"]`, incl. a mobile
  media-query variant.
- Reduced motion: iris expansion becomes a short crossfade (transition duration
  overridden to ~120ms under `prefers-reduced-motion`), ambient anims paused.

---

## 6. File-by-File Changes

### 6.1 `src/games/registry.ts` (edit one entry)
```diff
 "pixel-fishing": {
   id: "pixel-fishing",
   name: "Pixel Fishing",
-  presentation: "embedded",
+  presentation: "immersive",
   capabilities: {
     sound: false,
     pauseOffscreen: true,
-    touchFullscreen: false,
+    touchFullscreen: true,
   },
-  transition: { revealMs: 220, exitMs: 180 },
+  transition: { revealMs: 650, exitMs: 650 },
 }
```

### 6.2 `src/games/pixel-fishing/domain/state.ts` (rewrite)
Pure domain, no DOM/canvas imports. Exports for tests.

```ts
export type ZoneId = "shore" | "mid" | "deep";
export type PlayerLocation = "pier" | "boat";
export type FishingActivity =
  | "idle" | "walking" | "rowing"
  | "casting" | "waiting" | "fishBiting" | "reeling" | "landed";

export interface CatchDefinition {
  id: string; name: string; sprite: string;   // sprite = public URL
  size: "tiny"|"small"|"medium"|"large"|"huge"|"junk"|"treasure";
  tensionMultiplier: number;
}

export interface FishingState {
  location: PlayerLocation;
  activity: FishingActivity;
  facing: 1 | -1;
  playerX: number; boatX: number;
  moveDirection: -1 | 0 | 1;
  zone: ZoneId;
  elapsedMs: number; waitMs: number;
  progress: number; tension: number; reeling: boolean;
  hooked: CatchDefinition | null;
  lastCatch: CatchDefinition | null;
  escaped: boolean;
  haul: string[];                    // catch ids, cap 12
}

export type FishingEvent =
  | { type: "moveStart"; direction: -1 | 1 }
  | { type: "moveStop" }
  | { type: "interact" }            // board / disembark (contextual)
  | { type: "cast"; random: number }
  | { type: "press" } | { type: "release" }
  | { type: "tick"; deltaMs: number; random: number }
  | { type: "reset" };
```

Constants exported: `FISHING_TIMING`, `FISHING_RATES`, `WALK_SPEED`, `ROW_SPEED`,
`PIER_MIN_X/PIER_MAX_X`, `BOAT_MIN_X/BOAT_MAX_X`, `BOAT_DOCK_X`, `BOARD_RANGE`,
`HAUL_LIMIT`, `CATCHES` (catalog), `CATCH_TABLES` (zone weights).
Pure helpers: `createInitialFishingState`, `reduceFishingState`, `zoneForX`,
`chooseWaitMs`, `chooseCatch(zone, random)`, `canBoard(state)`, `canDisembark(state)`,
`fishingStatus(state)` (ARIA/status strings incl. boat prompts).

Reducer rules (all clamped/deterministic):
- `moveStart/moveStop` only in idle/walking/rowing; direction flips `facing`.
- `tick` integrates position (walk 28 px/s on pier bounds, row 34 px/s boat bounds),
  then advances activity timers (existing phase logic, tension × `hooked.tensionMultiplier`).
- `interact`: pier+near boat → location boat (activity idle, playerX hidden); boat+near
  dock → location pier at dock X.
- `cast`: only activity idle → casting (records `zone = zoneForX(...)`).
- bite roll: entering `reeling` keeps `hooked = chooseCatch(zone, random)` rolled when
  `fishBiting` began; escape clears `hooked`.
- `landed` after resultMs → idle; catch pushes `hooked.id` to haul (cap 12), sets
  `lastCatch`; junk/chest count as haul entries too.
- `reset` → `createInitialFishingState()` (haul cleared).

### 6.3 `src/games/pixel-fishing/rendering/assets.ts` (new)
Mirrors tiny-garden's loader.

```ts
export interface SpriteSpec { url: string; frameWidth: number; frameHeight: number;
  frames: number; fps: number; loopFrom?: number }
export const FISHING_SPRITES = {
  anglerIdle: { url: "/assets/games/fishing/characters/fisherman-idle.png",
    frameWidth: 48, frameHeight: 48, frames: 4, fps: 4 },
  anglerWalk: { ...6 frames, fps: 8 },
  anglerFish: { ...4, fps: 4 },
  anglerHook: { ...6, fps: 10 },   // played once during casting
  anglerRow:  { ...4, fps: 5 },
  water:      { url: ".../environment/water.png", frameWidth: 32, frameHeight: 32, frames: 3, fps: 3 },
} as const;
export const FISHING_STATICS = {
  hut: "/assets/games/fishing/environment/fishing-hut.png",
  pierTiles, boat, grass1..4, buoys, fishbarrel1..4,
  fish1..8, junkBarrel, junkBox, treasureChest,
} as const;
export type FishingAssets = Record<keyof typeof FISHING_SPRITES | keyof typeof FISHING_STATICS, HTMLImageElement>;
export async function loadFishingAssets(): Promise<FishingAssets>
```

### 6.4 `src/games/pixel-fishing/rendering/renderer.ts` (new)
`drawFishingScene(ctx, state, assets, timeMs, reducedMotion)` — draw order:
1. sky bands + sun/glow + clouds (drift unless reducedMotion)
2. hills silhouette
3. water: depth gradient, animated surface tiles (`frameAt(time,3fps,3)`), streaks
4. buoys (bob), fish shadows (waiting/biting: 2 sprites cruising, α 0.35, using
   `hooked.sprite` preview silhouettes), boat at boatX (bob + row tilt)
5. shore wedge + grass + hut
6. pier planks + posts
7. angler: activity→sheet map (idle/walk/row/fish/hook), `facing` flip via
   `scale(-1,1)`; positioned playerX on pier or seated in boat
8. line + bobber: casting = arc from rod tip; waiting = bob; biting = dip + "!"
9. landed: catch sprite leaps (parabolic 500ms), junk/chest variants
10. vignette + subtle grain

Helper `frameAt(timeMs, fps, frames)` → reducedMotion-safe frame index.
All coordinates snapped (`Math.round`), `imageSmoothingEnabled = false`.

### 6.5 `src/games/pixel-fishing/engine/runtime.ts` (rewrite)
- Owns: canvas ctx, RAF loop, ResizeObserver (existing logic), keyboard listeners
  (Arrows/A/D hold → moveStart/moveStop; Space/Enter → contextual action; ignored when
  adapter buttons have focus — buttons dispatch directly), asset preload promise.
- `createFishingGame(canvas, { reducedMotion, onChange, random })` → controller:
  `cast, press, release, moveStart, moveStop, interact, reset, setActive, setPaused,
  ready: Promise, destroy`.
- Reducer ticks only when `active` (shell phase), render always (attract mode preview).
- Pause releases held input (existing behavior kept).

### 6.6 `src/games/pixel-fishing/adapter.tsx` (rewrite)
Structure:

```tsx
<div className="fishing-stage" ref={surfaceRef} ...>
  <canvas ref={canvasRef} className="fishing-canvas" aria-hidden="true" />
  <div className="fishing-texture" aria-hidden="true" />

  {/* immersive iris system */}
  <div className="fishing-scrim" aria-hidden="true" />
  <div className="fishing-aperture-ring" aria-hidden="true" />
  <div className="fishing-transition-angler" aria-hidden="true" />

  {!active && (
    <div className="fishing-preview-ui">
      <div className="fishing-preview-label">…</div>
      <button className="fishing-play-button" onClick={actions.requestPlay}>
        <Play /> {phase === "loading" ? "Waking the lake" : "Start fishing"}
      </button>
    </div>
  )}

  {phase === "active" && (
    <>
      <header className="fishing-hud">
        <span className="eyebrow">Quiet Cast</span>
        <p className="status" aria-live="polite">{status}</p>
        <span className="fishing-haul"><img src={barrelFor(haul.length)} />×{haul.length}</span>
        <button className="fishing-exit" onClick={exit} aria-label="Exit fishing"><X /></button>
      </header>
      {meters when reeling}
      {catch card when landed (uses state.lastCatch.sprite via <img>)}
      <div className="fishing-controls">
        <div className="fishing-dpad">◀ ▶ hold buttons</div>
        <button className="fishing-action">{contextual label}</button>
      </div>
      <p className="fishing-help">Arrows/A D move · Space action · Esc exits</p>
    </>
  )}
</div>
```

Contextual action label: `Board boat` / `Go ashore` / `Cast line` / `Hook now!` /
hold-`Reel` / waiting dots — driven by `fishingStatus(state)` + activity.
Effect wiring identical to current adapter (reportLoading/reportReady/reportError,
setActive/setPaused, blur-release, preview-focus registration) + asset preload gate
before `reportReady()`.

### 6.7 `src/games/pixel-fishing/pixel-fishing.css` (new, plain CSS; deletes the module)
Sections:
1. stage/canvas/texture (from module, renamed to global classes, warm palette)
2. scrim (iris mask, copied technique from `.fight-scrim`), aperture-ring,
   transition-angler (background sprite + `steps()` keyframes)
3. preview UI (label, play button anchored to iris vars)
4. HUD (status, haul barrel, exit), meters, catch card (pixelated img)
5. controls: dpad hold-buttons + action button (pixel-border style, Press Start 2P)
6. `.hero-game-shell[data-hero-game-id="pixel-fishing"]` iris home overrides +
   immersive-active fullscreen stage sizing (mirrors globals' fight-stage rules)
7. mobile media queries (iris position, safe-area insets, controls sizing)
8. `prefers-reduced-motion` overrides (fast iris crossfade, paused ambience)

### 6.8 Deleted
- `src/games/pixel-fishing/pixel-fishing.module.css` (replaced by plain CSS)

### 6.9 Unchanged (verified)
- `src/games/core/*` (shell/lifecycle/types already support everything)
- `src/app/globals.css` (iris @property + immersive rules already generic; game-specific
  pieces addressable via `data-hero-game-id`)
- `src/components/hero.tsx` (gameId-driven already)

---

## 7. Tests

### 7.1 `tests/fishing-game.test.ts` (rewrite, keep `tick()` helper)
- phase loop: cast → waiting → biting → reeling → landed → idle
- movement: walk clamped to pier bounds; row clamped to boat bounds; facing flips
- board: allowed within range, denied far from boat; disembark mirror
- cannot cast while walking/rowing; cannot move during any fishing activity
- `zoneForX` boundaries (shore/mid/deep edges)
- `chooseCatch`: per-zone tables — shore can roll junk, deep can roll chest + shark,
  chest never in shore table; weights normalized
- tension multiplier: huge fish reaches escape faster than tiny (same inputs)
- haul: catch appends (incl. junk), cap at 12, reset clears; escaped keeps haul
- missed bite / tension snap / 12s stall → escaped (existing cases, adapted)

### 7.2 Existing suites to re-check
- `tests/game.test.ts` + `tests/hero-game.test.ts` — if they assert `pixel-fishing`
  presentation/capabilities/transition values, update expectations to immersive
  (sound stays false).
- `tests/public-routes.test.ts` — unaffected.

---

## 8. Docs

### 8.1 `docs/features/pixel-fishing.md` (rewrite)
New gameplay (walk/boat/zones/haul), immersive presentation + iris choreography,
asset manifest + provenance (CraftPix pack, curated copies under
`public/assets/games/fishing/`), updated **Boundaries** (see §9).

### 8.2 Boundary changes (owner-approved, recorded in doc)
Now allowed: zone-weighted catch tables (rarity-by-location), session-only haul display,
player movement + boat within the single lake scene.
Still forbidden: saves/persistence, economy/upgrades/quests, multiple locations/maps,
leaderboards, sound, catch-driven routes/unlocks, global input handlers.

---

## 9. Phases & Verification

| Phase | Work | Verify |
|---|---|---|
| **P1** | copy 26 assets → `public/assets/games/fishing/` | files exist, load via dev server URL |
| **P2** | `rendering/assets.ts` + `renderer.ts` static scene (sky/hut/pier/water/idle angler) | dev render check |
| **P3** | `domain/state.ts` rewrite + `tests/fishing-game.test.ts` green | `npm test` |
| **P4** | `engine/runtime.ts` + full renderer animation (walk/row/cast/fish/leap) | dev playthrough |
| **P5** | `adapter.tsx` + `pixel-fishing.css` (immersive iris + HUD + controls) | entrance/exit choreography check |
| **P6** | registry → immersive; update game/hero-game tests if needed; docs rewrite | `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` |

AGENTS.md reminder: if any Next.js API usage is touched, read
`node_modules/next/dist/docs/` first (this feature is client-side game code; unlikely).

---

## 10. Risks / Notes
- **Iris home position** depends on final scene composition → tune `--iris-x/y` overrides
  once the pier spot is rendered (P5).
- **CSS module → plain CSS** renames all classes; no other file imports the module.
- **Raw pack stays in `public/`** for now (incl. PSDs) — a later cleanup can move the
  whole pack out of `public/`; curated game assets are independent copies.
- **Mobile**: `touchFullscreen: true` ⇒ letterboxed arena + safe-area-aware controls,
  same approach as fighter.
- **Performance**: 26 small PNGs preloaded once; 480×270 canvas with DPR cap 2 — same
  budget class as current game.
