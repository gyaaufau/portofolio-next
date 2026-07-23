# Tiny Garden

## Purpose

Tiny Garden is a small embedded pixel-gardening experience for the portfolio hero. It is designed for a calm 20-40 second visit: choose one seed, walk to the soil, plant it, water it three times, enjoy the bloom, and plant again.

Registry identity:

```text
gameId: tiny-garden
displayName: Tiny Garden
playful label: Touch Grass
```

## Scope and Non-Goals

Tiny Garden owns only its local gameplay state, Canvas rendering, controls, assets, and adapter. It has no persistence, accounts, economy, inventory quantities, crafting, quests, NPC dialogue, day cycle, weather, energy, rewards, routes, or portfolio unlocks.

The game does not own hero copy, CTA links, navbar behavior, global appearance settings, or another mini-game's state.

## Architecture

```text
HeroGameShell
-> tiny-garden adapter
-> deterministic domain reducer and rules
-> requestAnimationFrame runtime
-> Canvas 2D renderer
-> 32px sprite atlases
```

- Domain modules define state, seed data, movement bounds, action guards, timings, growth, and messages.
- Runtime owns the animation loop, held movement, pause, reset, semantic snapshots, and injected scheduler/randomness.
- Renderer owns Canvas pixels, sprite frames, environment, and restrained ambient motion.
- Adapter owns the shared lifecycle bridge, focus, keyboard events, touch controls, seed buttons, and aria-live updates.

React state changes only for semantic gameplay snapshots. Character movement and frame animation stay inside the runtime and Canvas.

## State Machine

```text
idle
-> seedSelection
-> carryingSeed
-> planting
-> planted
-> watering
-> growing
-> planted (after water 1 and 2)
-> watering
-> growing
-> bloomed (after water 3)
```

Restart returns to `seedSelection`. Leaving or switching games returns the runtime to `idle` and clears all progress.

Character animation is separate from gameplay phase:

```text
idle | walking | kneeling | planting | watering | celebrating
```

## Seeds and Growth

The fixed initial seed set is:

| ID | Display name | Final plant |
|---|---|---|
| `sunflower` | Sunflower | Tall yellow sunflower |
| `tiny-flower` | Tiny Flower | Small coral flower |
| `little-bush` | Little Bush | Compact flowering shrub |

All seeds use five stages:

```text
planted seed -> sprout -> small plant -> growing plant -> bloomed plant
```

Planting takes 1.1 seconds. Watering takes 0.9 seconds and its growth feedback takes 1 second. Input remains locked during these actions. Exactly three watering actions complete the garden.

## Movement and Interaction

- Scene baseline: `320x180` logical pixels.
- Character and gameplay sprites: `32x32` logical cells.
- Character range: x `54-248`.
- Soil center: x `232`.
- Interaction radius: 42 logical pixels.
- Movement is horizontal only and rounded to integer positions.

Planting requires the carrying state, empty soil, and proximity. Watering requires planted soil, proximity, fewer than three waterings, and no action cooldown.

## Controls

Desktop:

| State | Left / A and Right / D | Space / Enter | Escape | R |
|---|---|---|---|---|
| Seed selection | Change seed | Confirm | Leave | None |
| Carrying seed | Walk | Plant near soil | Leave | None |
| Planted | Walk | Water near soil | Leave | None |
| Bloomed | None | Plant again | Leave | Plant again |

Mobile exposes left and right buttons only while movement is relevant, plus one contextual action and a Leave button. No drag gesture is required.

Keyboard events are handled only inside the focused active game region. Arrow keys retain normal page-scrolling behavior before activation. Blur, pause, visibility loss, pointer cancellation, exit, reset, and unmount clear held movement.

## Rendering and Assets

Runtime assets live in:

```text
public/assets/games/tiny-garden/
```

- `gardener.png`: `7x3` frame grid, `224x96`
- `plants.png`: `5x3` frame grid, `160x96`
- `environment.png`: `8x2` frame grid, `256x64`

The sheets were generated as coherent pixel art on a chroma-key background, converted to alpha, and normalized to exact `32x32` cells. Canvas image smoothing is disabled and CSS uses pixelated image rendering.

The environment uses soft forest greens, warm soil, a muted sky, and the portfolio accent for clean controls. Before bloom, only grass sway and one drifting leaf are prominent. After bloom, the leaf is replaced by one butterfly.

## Lifecycle and Performance

- The adapter module remains lazy through the hero-game registry.
- Sprite loading and runtime creation begin only when the hero is near the viewport.
- The loop pauses offscreen, when the document is hidden, or when the host pauses.
- Unmount destroys the runtime and cancels its pending animation frame.
- Tiny Garden uses no Phaser instance, physics engine, audio context, timers, global store, or third-party game dependency.
- Embedded presentation never becomes fullscreen and never toggles document scroll styles.

## Accessibility and Reduced Motion

- The interactive region has the registry's accessible label and a visible focus treatment.
- Seed selection uses `aria-pressed` in addition to color.
- Important semantic changes are announced through a polite, atomic aria-live region.
- All controls are native buttons with readable labels and comfortable touch size.
- Reduced motion keeps planting, watering, growth, and completion functional while freezing clouds, leaf drift, grass animation, and butterfly flight.
- Audio is intentionally omitted.

## Testing Strategy

Pure tests cover initial state, seed selection, movement boundaries, proximity, planting guards, watering, growth limits, bloom, restart, pause, cleanup, keyboard mapping, reduced motion, deterministic randomness, registry integration, and asset dimensions.

Runtime tests inject a fake frame scheduler and random function. They do not depend on exact browser frame timing.

## Known Limitations

- The active game remains `pixel-fighter`; selecting Tiny Garden requires changing the typed registry configuration.
- There is no persisted selected seed or completed garden.
- Canvas uses a fixed 16:9 logical scene and may show less decorative detail on narrow screens.
- Generated sprite art is normalized and replaceable, but has no source animation project file.

## Update Rules

Update this document when seed choices, state transitions, timing, controls, sprite-grid layout, lifecycle integration, accessibility behavior, or listed limitations materially change.
