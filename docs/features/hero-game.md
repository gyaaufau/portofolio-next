# Hero Games

The homepage hero hosts optional mini-games through a shared, engine-neutral shell.

## Shared architecture

`HeroGameShell` owns lazy loading, preview/active lifecycle, visibility pausing, reduced-motion detection, focus restoration, error fallback, and retry. Each registered game supplies a dynamically imported React adapter and declares one presentation mode:

- `embedded` keeps portfolio copy, navigation, and scrolling available.
- `immersive` may temporarily take over the viewport and lock body scrolling.

The registry in `src/games/registry.ts` contains both games and selects exactly one typed active ID.

## Implementations

- [`pixel-fishing.md`](./pixel-fishing.md) — active lightweight Canvas fishing game, registered as `pixel-fishing`.
- [`pixel-fighter.md`](./pixel-fighter.md) — retained Phaser fighting game, registered as `pixel-fighter`.

Keep game-specific state, rendering, controls, and styles inside the owning game module. Shared contracts must not contain fishing, fighting, Canvas, or Phaser domain types.
