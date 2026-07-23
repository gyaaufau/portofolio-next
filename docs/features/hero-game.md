# Hero Games

## Purpose

The hero-game system hosts optional, lazy-loaded interactive ornaments inside the homepage hero. Games cannot own navigation, unlock portfolio content, or block normal portfolio use.

## Shared Contract

`src/games/registry.ts` is the typed registry and configuration boundary. Every game supplies:

- Stable ID, name, accessible label, and fallback message
- `immersive` or `embedded` presentation
- Sound, offscreen-pause, and touch-fullscreen capabilities
- Reveal and exit timing
- A dynamic adapter loader

`ACTIVE_HERO_GAME_ID` is the current build-time selection. Registering a game does not make it active.

## Presentation Modes

| Mode | Behavior |
|---|---|
| `immersive` | May become fullscreen, lock body scrolling, and hide hero copy while active |
| `embedded` | Remains inside the hero and never changes document scrolling or navigation visibility |

## Lifecycle

```text
preview -> loading -> revealing -> active -> exiting -> preview
                         |                    |
                         +------ error <------+
```

The shared shell owns adapter loading, focus transfer, viewport and document visibility, reduced-motion detection, mute state, pause requests, errors, retry, and transition cleanup. Each adapter owns its own gameplay state and rendering.

## Registered Games

- [`pixel-fighter.md`](./pixel-fighter.md): immersive Phaser fighting game, ID `pixel-fighter`
- [`tiny-garden.md`](./tiny-garden.md): embedded Canvas 2D gardening game, ID `tiny-garden`

## Integration Rules

- Keep adapters dynamically imported.
- Keep engine-specific types out of `src/games/core/`.
- An embedded game must not toggle global document styles.
- Adapters must pause and clear held input when requested by the host.
- Adapters must destroy animation frames, observers, listeners, timers, and engine instances on unmount.
- The hero copy and portfolio routes remain independently usable.

## Testing Priorities

- Registry IDs remain unique and loaders stay lazy.
- Presentation mode controls immersive document behavior.
- Lifecycle transitions ignore irrelevant events.
- Visibility pauses only active games that opt into offscreen pause.
- Switching or remounting a game does not retain adapter state or resources.
