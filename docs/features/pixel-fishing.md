# Pixel Fishing

## Purpose

Pixel Fishing, displayed as **Quiet Cast**, is the active decorative mini-game in the homepage hero. It provides a calm, short fishing interaction without rewards, progression, persistence, or navigation.

## Architecture

```text
Homepage Hero
→ HeroGameShell (embedded presentation)
→ PixelFishingAdapter
→ Canvas 2D runtime
→ pure fishing state reducer
```

The adapter owns accessible controls and shared-shell lifecycle integration. The runtime owns the animation loop, responsive Canvas drawing, and timing. The pure reducer owns all gameplay transitions and rules. No fishing code imports Pixel Fighter, and the game adds no dependencies or image assets.

## Gameplay

```text
idle → casting → waiting → fishBiting → reeling → caught | escaped → idle
```

- Casting lasts 600 ms, followed by a random 1.5–4 second wait.
- A bite must be hooked within one second.
- Holding the action reels; releasing lowers tension without removing progress.
- Progress rises 28 points/second while held.
- Tension begins at 20, rises 38 points/second while held, and falls 48 points/second while released.
- Reaching 100 progress catches the fish. Reaching 100 tension or spending 12 seconds reeling lets it escape.
- Results display for 1.6 seconds before returning to idle.
- Bluegill, River Perch, Tiny Koi, and Golden Carp are uniformly selected visual flavor only.

## Controls and accessibility

- Visitors explicitly start and exit fishing.
- Cast, Hook, and Hold-to-reel use a visible button; Space and Enter work while it is focused.
- Escape exits only while focus is inside the active game.
- Pointer input is restricted to buttons, so the Canvas never captures scrolling gestures.
- Status updates use an ARIA live region, and catch/tension meters expose progress semantics.
- Leaving the viewport or hiding the document pauses timers and releases held input.
- Reduced-motion mode removes ambient scene motion while preserving gameplay feedback.

## Visual direction and performance

The scene is drawn at a 320×180 logical resolution: misty dawn water, sunrise, hills, reeds, a dock, a seated angler, bobber, and fish silhouettes. Canvas smoothing is disabled, backing resolution is capped at 2× device pixel ratio, and `ResizeObserver` keeps it responsive. Animation stops offscreen. There is no audio.

## Boundaries

The game must never add inventory, economy, rarity, upgrades, quests, equipment, locations, saves, leaderboards, portfolio unlocks, catch-driven routes, or global input handlers. Update this document whenever timings, fish flavor, controls, rendering, or lifecycle behavior changes.
