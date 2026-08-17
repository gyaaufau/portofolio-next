# Pixel Fishing

## Purpose

Pixel Fishing, displayed as **Quiet Cast**, is a playable fishing mini-game in the
homepage hero with an immersive circular-aperture entrance (the same choreography as
Pixel Duel). The visitor walks a pier, rows a boat across the lake, and catches
zone-dependent fish. Catches are session-only flavor: no rewards, persistence, or
navigation outcomes.

## Architecture

```text
Homepage Hero
→ HeroGameShell (immersive presentation)
→ PixelFishingAdapter
→ Canvas 2D runtime (engine/runtime.ts)
→ pure fishing state reducer (domain/state.ts)
→ sprite renderer (rendering/renderer.ts + rendering/assets.ts)
```

The adapter owns accessible controls, keyboard mapping (`engine/input.ts`), and
shared-shell lifecycle integration. The runtime owns the animation loop, responsive
Canvas drawing, and timing. The pure reducer owns all gameplay transitions and rules.
The renderer owns all drawing against preloaded sprite assets. No fishing code imports
Pixel Fighter, and the game adds no dependencies.

## Assets

Sprites come from the licensed CraftPix free fishing pack. The raw pack stays untouched
in `public/assets/games/craftpix-net-258377-free-fishing-game-assets-pixel-art-pack`
(same source-archive pattern as `FIGHTGAME_Assets`); curated copies used by the game
live under `public/assets/games/fishing/`:

- `characters/fisherman-{idle,walk,fish,hook,row}.png` — 48px frames (4/6/4/6/4)
- `environment/{water,pier-tiles,fishing-hut,boat,grass-1..4,buoys}.png`
- `catch/fish-{1..8}.png`, `catch/{junk-barrel,junk-box,treasure-chest}.png`
- `props/fishbarrel-{1..4}.png` — session haul meter fill levels

`rendering/assets.ts` declares frame metadata and preloads everything before the
adapter reports ready. The pier planks are drawn procedurally in the pack's wood
palette; the `pier-tiles` tileset is copied but unused in v1 (its tile layout needs
visual mapping first).

## Immersive entrance

The registry entry uses `presentation: "immersive"` with 650 ms reveal/exit, reusing
the global iris system (`@property --iris-*` in `globals.css`, shell phase classes,
fullscreen takeover, scroll lock). `pixel-fishing.css` provides the game-owned pieces:

- `.fishing-scrim` — dark pixel-grid overlay with a masked circle at the iris position
- `.fishing-aperture-ring` — accent ring at the iris edge
- `.fishing-transition-angler` — CSS sprite (idle sheet) that glides to the pier during reveal
- Play button anchored under the iris; iris home pinned via
  `.hero-game-shell[data-hero-game-id="pixel-fishing"]` overrides

In fullscreen active mode the canvas letterboxes to 16:9 (`container-type: size` +
cqw units) and HUD/controls respect `safe-area-inset-*`. Reduced motion shortens the
iris transition and pauses ambient animation while keeping gameplay feedback.

## Gameplay

### Movement and boat

- Arrows or A/D walk the angler along the shore and pier (`x∈[36,204]`, 28 px/s).
- The action button becomes **Board boat** within 28 px of the moored boat; boarding
  works while walking past it (no full stop required).
- In the boat, arrows row (`x∈[140,444]`, 34 px/s); **Go ashore** appears near the
  pier (`boatX ≤ 240`) and returns the angler to the dock.
- The boat stays where it was left; casting requires standing still.

### Fishing loop

```text
idle → casting(600ms) → waiting(1.5–4s) → fishBiting(1s window)
     → reeling(hold/release tension) → landed(1.6s) → idle
```

- Progress rises 28 points/second while held; tension starts at 20, rises 38/second
  held (× the hooked catch's multiplier), falls 48/second released.
- 100 progress lands the catch; 100 tension or a 12-second reel loses it.
- The hooked catch is rolled at bite time from the cast zone's weighted table via
  `chooseCatch(zone, random)` (pure, injectable random).

### Catch zones

Cast position picks one of three weighted tables: **shore** (pier), **mid**
(boat, x<330), **deep** (boat, x≥330). Deep water holds the Reed Pike, Rosy Bream,
Lake Shark, and the rare Sunken Chest; shore water mixes small fish with junk
(Weathered Barrel, Soggy Crate). Bigger catches raise tension faster
(`tensionMultiplier` 0.8–1.3). Junk and treasure count as haul entries.

### Session haul

The HUD barrel icon fills (`fishbarrel-1 → -4`) as the haul grows and the catch card
shows the caught sprite, name, and flavor line. The haul is capped at 12 entries and
cleared on exit/reset. **Nothing persists.**

## Controls and accessibility

- Visitors explicitly start and exit fishing; Escape exits while focus is inside the game.
- Keyboard: arrows/A D move, Space/Enter is the contextual action (board, ashore, cast,
  hook, hold-to-reel). Key handlers live on the stage element, never globally.
- Touch: ◀ ▶ hold-buttons with pointer capture plus one contextual action button;
  the Canvas never captures scrolling gestures.
- Status updates use an ARIA live region; meters expose progressbar semantics.
- Leaving the viewport or hiding the document pauses timers and releases held input.

## Visual direction and performance

The scene renders at 480×270 logical resolution in the pack's warm sunset palette:
dusk sky, hills, animated 3-frame water tiles, stilt hut, shore grasses, procedural
pier, buoys, boat, and the animated angler. Fish shadows cruise below the bobber while
waiting; the hooked catch wiggles during the fight and leaps on landing. Canvas
smoothing is disabled, backing resolution is capped at 2× DPR, and `ResizeObserver`
keeps it responsive. Animation stops offscreen. There is no audio.

## Boundaries

The game must never add saves/persistence, economy, upgrades, quests, multiple
locations or maps, leaderboards, sound, catch-driven routes/unlocks, or global input
handlers. Zone-weighted catch tables (rarity by location), the session-only haul
display, and pier/boat movement within the single lake scene are deliberate,
owner-approved scope. Update this document whenever timings, catches, zones, controls,
rendering, assets, or lifecycle behavior changes.
