# Pixel Artillery

## Purpose

Tiny Artillery is a short, optional 1v1 pixel-art duel embedded in the portfolio hero. It gives visitors a playful interaction without adding accounts, progression, navigation, or persistent game state.

Internal identity:

- Game ID: `pixel-artillery`
- Display name: `Tiny Artillery`
- Preview label: `Ant Warfare`

## Scope

The game includes one player ant, one AI ant, one static battlefield, one projectile, angle and power controls, light wind, health, splash damage, alternating turns, results, and immediate restart.

Explicit non-goals include multiplayer, multiple maps, teams, inventories, progression, currency, destructible terrain, campaigns, leaderboards, routing, save files, and additional weapons.

The tone takes inspiration from compact turn-based artillery games such as Worms and DDTank, but does not reproduce their team, weapon, terrain, or progression systems.

## Local Integration

The current branch already provides a neutral hero game boundary:

```text
src/components/hero.tsx
→ src/games/core/hero-game-shell.tsx
→ src/games/registry.ts
→ src/games/pixel-artillery/adapter.tsx
```

The shell owns module loading, preview and active transitions, error fallback, viewport and document visibility, focus restoration, reduced-motion detection, and immersive document scroll locking.

The adapter implements the existing `HeroGameAdapterProps` contract. It translates host runtime state into artillery pause and cleanup behavior. It does not import routing or alter portfolio content.

This branch does not claim compatibility with unfinished game branches or worktrees.

## Match State Machine

```text
ready
→ playerAiming
→ playerProjectile
→ resolvingPlayerHit
→ enemyThinking
→ enemyProjectile
→ resolvingEnemyHit
→ playerAiming

Terminal: playerWon | playerLost
```

Match state is reducer-owned. Frame-level projectile values remain in an isolated animation driver and are not copied into React state each frame.

## Turn Flow

The player starts with full health and adjusts angle and power before firing. One projectile resolves against an ant, terrain, or bounds. Damage is applied once, the result is checked, wind changes, and the enemy turn begins.

The enemy chooses one shot, waits 500-1100 milliseconds, fires, resolves damage, and returns control to the player unless either ant has been defeated.

## Controls

Desktop:

- Up or W: increase angle
- Down or S: decrease angle
- Left or A: decrease power
- Right or D: increase power
- Space or Enter: fire
- R: restart after a result
- Escape: exit the immersive game

Keyboard commands are handled only by the focused game surface. The game does not capture inactive page input.

Mobile uses five buttons for angle down/up, power down/up, and Fire. Controls are disabled outside the player aiming phase.

## Projectile Model

The simulation uses a `384 × 256` logical world and a fixed `1/120s` step. Frame deltas are clamped to 50 milliseconds before entering the fixed-step accumulator.

Power maps from 20-100 percent to a launch speed of 90-185 logical pixels per second. Gravity adds 110 vertical acceleration units. Normalized wind ranges from -0.8 to 0.8 and contributes at most 8 horizontal acceleration units.

The dotted preview and live projectile use the same launch and step functions. Collision checks ants, static terrain, and scene bounds. A projectile carries a resolution guard so an impact cannot apply twice.

## Wind and Damage

Wind changes once per turn through the injected seeded random source. It is visible in the HUD and remains weak enough that angle and power dominate the shot.

Both ants start at 100 HP:

- Direct radius: 12 logical pixels
- Direct damage: 40
- Splash radius: 48 logical pixels
- Splash damage: linear falloff from 30 to 10
- Outside splash radius: 0

Health is clamped between 0 and 100. Terrain does not deform. Dust and impact marks are presentation only.

## Enemy AI

AI estimates distance, selects an angle, computes a ballistic speed, applies a small wind compensation, and converts the result to power. It then applies one seeded accuracy band:

- 20 percent poor
- 50 percent near
- 30 percent strong

The result is clamped to player-valid angle and power ranges. The calculation runs once per enemy turn and does not search every frame.

## Rendering and Pixel Art

The battlefield uses Canvas 2D with device-pixel-ratio backing resolution, nearest-neighbor rendering, and rounded draw coordinates. Ants and decorations are code-rendered inside an approximately 32 × 32 logical footprint, so no binary sprite pipeline is required.

The renderer is split into terrain, ant, trajectory, projectile, and impact passes. The animation frame loop runs only while a projectile or short impact effect is active.

The palette extends the existing deep-green hero and site accent. Pixel typography is limited to short game labels; controls use the portfolio sans-serif.

## Lifecycle and Cleanup

The adapter cancels projectile frames, AI timers, resolution timers, effect frames, ResizeObserver work, and visibility listeners during exit, retry, pause, or unmount. Blur and visibility loss clear held keys. Resuming resets frame timing so hidden elapsed time cannot advance a shot.

No match data persists. Restart restores health, turn order, aim, power, wind, projectile state, and result state without reloading the page.

## Accessibility

- The shell provides the labeled game region.
- Important turns, settings, shots, damage, victory, and defeat are announced through `aria-live`.
- HUD values use text in addition to color.
- All controls are native buttons with accessible names and visible focus.
- Sound is omitted.
- Portfolio content remains available without activating the game.

## Reduced Motion

Reduced motion preserves aiming, projectile simulation, collision, damage, and turn flow. It shortens hit resolution, removes repeated impact animation frames, and reduces trajectory dots.

## Testing Strategy

Pure tests cover the reducer, launch physics, fixed-step motion, wind, trajectory prediction, collision, damage, turn changes, results, restart, seeded AI, focus-gated input, and animation-driver cleanup. Registry tests verify that artillery is selected through the existing lazy module contract. Repository lint, type checking, and production build provide integration coverage.

## Known Limitations

- One static battlefield and one projectile type
- No audio
- No terrain deformation
- No persistent statistics or saved match
- AI ignores small terrain elevation differences when estimating its first velocity
- Immersive play intentionally locks document scrolling until exit

## Future Integration Notes

The artillery reducer, simulation, AI, input mapping, and renderer are independent of hero presentation. A future shared game engine can replace the adapter without changing the deterministic rules. Do not copy assumptions from other worktrees into this branch without reconciling their actual contracts.
