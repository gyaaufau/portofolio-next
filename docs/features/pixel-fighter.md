# Pixel Fighter

## Purpose

Pixel Fighter is the registered **Pixel Duel** fighting game retained for the modular homepage hero. It gives visitors a playable demonstration of client-side game development using Phaser, responsive controls, deterministic AI, and a licensed pixel-art asset pack. Pixel Fishing is currently the active hero game.

---

## Ownership

This feature owns:

- Game registration and selection in `src/games/registry.ts`
- Shared hero-game lifecycle in `src/games/core/`
- React/Phaser adapter and presentation in `src/games/pixel-fighter/`
- Combat, movement, AI, rounds, items, and arena rules
- Atlas generation in `scripts/build-fightgame-atlas.mjs`
- Source art in `public/FIGHTGAME_Assets/`
- Runtime atlases in `public/games/pixel-fighter/generated/`

This feature does not own:

- Homepage hero layout, which belongs to the `homepage` feature
- Phaser itself, which is an external dependency
- Global site appearance and accent-color settings

Related documentation:

- `docs/features/homepage.md` — hosts the game in the hero section
- `docs/integrations/phaser-game.md` — defines the Phaser integration boundary

---

## Entry Point and User Flow

Primary route:

```text
/ (homepage hero section)
```

Flow:

```text
Static arena preview appears
→ hero approaches the viewport
→ React dynamically imports the Pixel Fighter adapter
→ adapter mounts Phaser
→ visitor selects a fighter and presses Enter Battle
→ the preview fighter fades in place and a 700 ms circular aperture reveals the arena
→ best-of-three match runs against an AI opponent
→ visitor replays, returns to fighter selection, or visits /apps
```

`src/games/registry.ts` registers the game as `pixel-fighter` and displays the name `Pixel Duel`. It can be reactivated through `ACTIVE_HERO_GAME_ID`.

---

## Runtime Architecture

```text
Homepage Hero
→ HeroGameShell
→ ACTIVE_HERO_GAME registry entry
→ PixelFighterAdapter
→ mountFightGame()
→ Phaser.Game
→ FightScene
→ pure domain modules for combat, movement, AI, items, layout, and rounds
```

The game uses Phaser 4.1 with Arcade Physics at a fixed 60 FPS. The authored world remains fixed at 300×200 pixels and uses `Phaser.Scale.FIT`. Desktop gameplay is centered in a 3:2 frame capped at 960×640; mobile keeps a centered 3:2 field between the fullscreen HUD and touch controls.

The React adapter owns selection, lifecycle, HUD, pause/result overlays, and touch controls. Phaser owns rendering, physics, keyboard input, combat execution, projectiles, effects, and sample playback.

The imperative adapter boundary exposes:

- `start()`
- `replay()`
- `pause(paused)`
- `setMobileInput(input)`
- `setMuted(muted)`
- `destroy()`

---

## Lifecycle and Persistence

State owner:

```text
HeroGameShell → PixelFighterAdapter → FightScene
```

Important rules:

- The adapter and Phaser bundle load only when the hero approaches the viewport.
- The game pauses when the hero leaves the viewport, the document becomes hidden, the user pauses manually, or a result overlay is open.
- Pressing Enter Battle enables sound as an explicit user interaction; the in-match mute control remains available.
- Reduced-motion mode stops decorative preview and ambient movement and disables camera shake/hit pause.
- Engine failures are caught by the shared error boundary and leave the static preview available.
- Match state is transient and resets on page reload.
- The selected fighter persists in `localStorage` under `gialoop-fighter`; invalid stored values are ignored.

---

## Roster and Character Assets

The source pack contains 122 character PNG files: 41 for Marston, 33 for Musashi, and 48 for Namka. Every combat-animation source frame is declared in the roster manifest. The three `name.png` files are used directly by the React character selector; their additional copies inside the Phaser character atlas are not used by the engine.

### Marston

| Property | Value |
|---|---|
| Role | Balanced gunslinger |
| Speed / jump / weight | 74 / 146 / 1.0 |
| Ground combo damage | 5 → 7 → 11 |
| Special | Revolver projectile, 11 damage, projectile speed 180 |
| AI profile | Medium aggression, preferred range 76 |

Asset mapping:

- `Idle.png` — idle and preview portrait
- `running/` — unarmed run and dodge pose
- `running_gun/` — movement while recently armed
- `jump/`, `fall.png` — aerial movement
- `attack1/`, `attack2/`, `attack3/` — three-stage combo
- `gun_start/` + `gun_shoot/` — revolver special
- `damage/`, `death_hit/`, `death_ground/` — hurt and knockout
- `name.png` — roster label
- `FXs/MuzzleFlash.png` — muzzle flash
- Procedurally generated 3×1 gold texture — bullet projectile

### Musashi

| Property | Value |
|---|---|
| Role | Fast close-range swordsman |
| Speed / jump / weight | 88 / 154 / 0.88 |
| Ground combo damage | 5 → 7 → 12 |
| Special | Dash strike, 14 damage, dash speed 172 |
| AI profile | Highest aggression, preferred range 27 |

Asset mapping:

- `Idle.png` — idle and preview portrait
- `running/` — normal and armed running
- `jump.png`, `fall/` — aerial movement
- `attack1/`, `attack2/`, `attack3/` — three-stage sword combo
- `dash_attack/` + `dash_stop/` — dash-strike special
- `dash.png` — dodge
- `damage/`, `death_hit/`, `death_ground/` — hurt and knockout
- `name.png` — roster label

### Namka

| Property | Value |
|---|---|
| Role | Powerful space controller |
| Speed / jump / weight | 66 / 140 / 1.15 |
| Ground combo damage | 4 → 4+4 → 13 |
| Special | Snow projectile, 10 damage, projectile speed 142 |
| AI profile | Lowest aggression, preferred range 82 |

Asset mapping:

- `Idle.png` — idle and preview portrait
- `running/`, `running_gun/` — normal and armed movement
- `jump/`, `fall/` — aerial movement
- `attack_prepare/` — first combo stage
- `attack/` frames 1–4 — second combo stage
- `attack/` frames 5–9 — third combo stage
- `gun_prepare/` + `gun_shot/` — snow-shot special
- `damage/`, `death_hit/`, `death_ground/` — hurt and knockout
- `name.png` — roster label
- `FXs/Snowball.png` — projectile
- `snow3` effect — projectile launch trail

---

## Shared Asset Inventory

The runtime loads optimized Phaser atlases from `public/games/pixel-fighter/generated/`.

| Atlas | Frames | Runtime responsibility |
|---|---:|---|
| `characters` | 122 | Fighter animations; includes three unused atlas copies of name labels |
| `environment` | 34 | Background, fog, trees, foliage, platforms, props, and post-processing |
| `effects` | 82 | Impacts, smoke, snow, and speed lines |
| `finishers` | 54 | Glow and clean knockout explosions; 36 frames are played |
| `items` | 7 | Three containers and four pickups |

### Environment

- `ENVIRO/Background/background_color.png` and `fog_color.png` form the arena base and atmospheric depth.
- Eight `tree_trunk` images and five `tree_leaves` images build the forest layers.
- `ENVIRO/Level Design/platform.png`, `platform_edge.png`, and four `trunk` images form the stage.
- Six lianas, two grasses, and two flowers decorate and animate the scene.
- `POSTPRO/overlay.png`, `lineardodge.png`, and `vignette.png` provide the final screen treatment.
- The React-only preview directly loads a subset of the source background, tree, leaf, platform, idle, and name images.

### Effects

| Effect | Usage |
|---|---|
| `impact1` | Light hits |
| `impact2` | Medium hits and container damage |
| `impact3` | Heavy and projectile hits |
| `impactHUGE` | Major combo finishers and knockouts |
| `smoke1–3` | Footsteps and jumps |
| `smoke3–5` | Combo trails |
| `smoke4` | Dodge trail |
| `smoke6` | Supply-container arrival and destruction |
| `snow1–3` | Ambient particles, pickups, and Namka's projectile |
| `Speed_OnScreen` | Heavy knockback, haste, and sudden death |
| `OUT!` + `OUT!_NoGlow` | Layered knockout animation |

### Non-runtime pack files

The following files are reference/source material and are not loaded by the game:

- `Mockup.png`
- `CHARAs.gif`
- `FXs.gif`
- `ReadMePLS.txt`
- `public/FIGHTGAME_Assets/generated/` duplicate atlas output

The included readme identifies the purchased pack as **FIGHT GAME ASSET PACK by Thomas Lean**, but it does not contain the full redistribution terms. Retain and verify the original license before changing how these public assets are distributed.

---

## Gameplay Rules

### Match

- Single player against a seeded deterministic AI opponent.
- Opponent selection never creates a mirror match.
- Each round lasts 45 seconds.
- A timeout awards the round to the fighter with more vitality.
- Equal vitality at timeout sets both fighters to one vitality and starts sudden death.
- First fighter to two round wins takes the match.
- A fighter loses a round at zero vitality or after crossing a blast boundary.
- Score currently comes only from coin pickups.

### Combat and Movement

- Ground attacks automatically advance through a three-stage combo.
- Aerial combos stop after two stages.
- Each fighter has one character-specific special with its own cooldown.
- Dodge has a 190 ms active window and 620 ms cooldown; attacks can only dodge-cancel during recovery.
- Knockback increases as remaining vitality decreases and is divided by character weight.
- Movement supports double jump, 105 ms coyote time, 115 ms jump buffering, and fast fall.
- Fighters can recover from below or near the edge of the stage.
- Hit feedback includes animation, hit stun, effects, camera shake, and short hit pause unless reduced motion is enabled.

### AI

The AI evaluates distance, stage position, vitality, hit stun, opponent attacks, active containers, and useful pickups. It can approach, retreat, jump, attack, dodge, pursue, edge-guard, recover, reposition, break containers, and collect items. Character definitions tune aggression, preferred range, dodge chance, and jump chance.

---

## Containers and Pickups

One container is scheduled 12–18 seconds after each round begins. After it is destroyed and its item collected, another is not scheduled until the next round.

| Container | Asset | Hit points |
|---|---|---:|
| Wooden crate | `ITEMs/caisse.png` | 2 |
| Metal crate | `ITEMs/caisse_metal.png` | 3 |
| Chest | `ITEMs/chest.png` | 3 |

| Pickup | Asset | Effect |
|---|---|---|
| Heal | `ITEMs/bonus1.png` | Restore 12 vitality, capped at 100 |
| Cooldown | `ITEMs/bonus2.png` | Make the special immediately available |
| Haste | `ITEMs/bonus3.png` | Increase movement speed by 15% for five seconds |
| Coin | `ITEMs/coin.png` | Add 100 score |

Both the player and AI can damage containers and collect pickups.

---

## Controls and UI

Desktop controls:

| Action | Input |
|---|---|
| Move | `A` / `D` or Left / Right arrows |
| Jump | `W`, Up arrow, or Space |
| Fast fall | `S` or Down arrow while airborne |
| Combo | `J` |
| Special | `K` |
| Dodge | Shift |
| Pause | `P` or the pause button |
| Exit | Escape or the exit button |

Mobile controls provide left, right, jump, combo, special, and dodge. Below 768 px, the active game becomes a fullscreen experience with safe-area-aware HUD and controls.

Owned UI includes:

- Layered static preview, stationary fighter fade, and 700 ms iris reveal transition
- Character roster and persisted selection
- Vitality bars, round counters, timer, notices, and best-of-three label
- Mute, pause, and exit controls
- Mobile touch controls
- Pause and match-result overlays
- Replay, fighter-selection, and `/apps` actions

---

## Audio

Phaser preloads compact CC0 samples from `public/games/pixel-fighter/audio/`. The manifest provides deterministic variants and tuned volume for:

- wooden footsteps and jumps,
- generic swings, Musashi sword slices, and dash,
- Marston's revolver and Namka's snow shot,
- light, medium, heavy, and finisher impacts,
- wooden and metal container hits,
- coin and power-up pickups,
- knockout.

Melee swings play 35 ms before the first hit window. Projectile sounds play at the actual launch window, so Namka uses a snow cue rather than a gunshot. Repeated variants rotate independently from the seeded gameplay RNG.

Sources and redistribution notes are recorded in `public/games/pixel-fighter/audio/LICENSES.md`. The selected files come from Deva's 8-Bit Sound Effect Pack and Kenney's RPG Audio and Impact Sounds, all under CC0 1.0.

---

## Asset Pipeline

Source:

```text
public/FIGHTGAME_Assets/
```

Generated runtime output:

```text
public/games/pixel-fighter/generated/
```

Build command:

```bash
npm run game:atlas
```

The generator uses Sharp, a maximum atlas width of 1024 pixels, and two pixels of packing padding. Character frames are normalized to one canvas size per character, bottom-aligned, and assigned a bottom-center pivot. Do not hand-edit generated atlas files.

---

## Failure and Edge Cases

| Case | Expected behavior |
|---|---|
| Phaser module or engine initialization fails | Shared error UI appears and the static preview remains available |
| Hero leaves the viewport or document is hidden | Match pauses automatically |
| Reduced motion is enabled | Decorative motion, camera shake, and hit pause are suppressed |
| Stored fighter ID is invalid | Selection falls back to Musashi |
| Round timer expires with equal vitality | One-hit sudden death begins |
| Projectile hits a container | Container takes damage and the projectile is released |
| Both fighters leave the arena simultaneously | Higher remaining vitality wins; the player wins an exact tie |
| Finisher atlas is not ready at knockout | Core impact effects play, but the layered `OUT!` animation is skipped |

---

## Known Limitations and Audit Findings

- Mobile has no `down` control, so touch players cannot fast fall.
- Visible desktop instructions omit fast fall, alternate arrow/Space controls, keyboard pause, and Escape.
- `public/FIGHTGAME_Assets/generated/` duplicates the runtime atlas directory and costs approximately 312 KB.
- The finisher atlas packs 18 unused underscored glow frames (`BOUM_*.png`).
- The character atlas packs three unused copies of the character name images.
- The complete source pack remains publicly deployable alongside the optimized atlases; the source directory is approximately 8.3 MB.
- The lazily loaded finisher atlas is not awaited before combat, so an unusually fast first knockout can miss the layered finisher animation.
- The included pack readme does not provide complete license/redistribution terms.
- There is no local multiplayer, online multiplayer, server authority, saved match progress, or leaderboard.
- Pickups do not expire and only one container is scheduled per round.

---

## Testing Priorities

Automated domain coverage currently verifies:

- Complete character manifests and referenced character frames
- Complete sound manifests, committed sample files, character-specific cues, and cue timing
- Valid Phaser atlas metadata
- Damage, knockback, timeouts, sudden death, and best-of-three rules
- Deterministic non-mirror opponent selection
- Coyote time, jump buffering, double jump, fast fall, and blast boundaries
- Combo progression, hit windows, aerial limits, and dodge cancellation
- Animation-state stability
- Container selection, drops, and pickup effects
- Responsive arena geometry
- AI recovery, combat, dodging, container, and pickup behavior

Add or prioritize integration coverage for:

- React character selection and `localStorage` restoration
- Desktop and touch input parity
- Lifecycle-driven pause/resume behavior
- Actual Phaser loading and rendering
- Audio mute/unmute behavior
- Lazy finisher loading during a fast knockout
- Error-boundary and static-preview fallback behavior

---

## Where to Change

| Change | Primary location |
|---|---|
| Registry or active game | `src/games/registry.ts` |
| Shared lifecycle | `src/games/core/` |
| Roster, stats, animation mapping | `src/games/pixel-fighter/domain/characters.ts` |
| Combat and movement rules | `src/games/pixel-fighter/domain/` |
| Phaser rendering and runtime | `src/games/pixel-fighter/engine/` |
| React HUD and controls | `src/games/pixel-fighter/adapter.tsx` |
| Game presentation | `src/games/pixel-fighter/pixel-fighter.css` |
| Source art | `public/FIGHTGAME_Assets/` |
| Atlas generation | `scripts/build-fightgame-atlas.mjs` |
| Generated runtime atlases | `public/games/pixel-fighter/generated/` |
| Domain, atlas, and sound tests | `tests/game.test.ts` |

---

## Feature-Specific Agent Rules

- Keep the game dynamically imported; do not add Phaser to the main page bundle.
- Run `npm run game:atlas` after source-art or atlas-build changes.
- Treat `public/FIGHTGAME_Assets/` as licensed source material and verify rights before moving or redistributing it.
- Do not hand-edit generated atlas PNG or JSON files.
- Keep combat rules in pure domain modules when they do not require Phaser state.
- Preserve the static preview and error fallback when changing engine initialization.

---

## Update Rules

Update this document when:

- roster, stats, attacks, controls, items, AI, or match rules change,
- asset mappings or atlas contents change,
- lifecycle, persistence, or fallback behavior changes,
- Phaser configuration or adapter contracts change,
- a listed limitation is resolved or a new material limitation is found.

Do not update it for minor visual polish that does not change behavior or ownership.
