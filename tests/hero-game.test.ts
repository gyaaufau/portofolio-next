import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isHeroGameImmersive, reduceHeroGamePhase, shouldPauseHeroGame } from "../src/games/core/lifecycle";
import type { HeroGameDefinition } from "../src/games/core/types";
import { ACTIVE_HERO_GAME_ID, HERO_GAMES, selectHeroGame, validateHeroGameRegistry } from "../src/games/registry";

test("hero games are typed, registered, and uniquely identified", () => {
  assert.equal(ACTIVE_HERO_GAME_ID, "pixel-fighter");
  assert.equal(validateHeroGameRegistry(HERO_GAMES), true);
  assert.equal(HERO_GAMES[ACTIVE_HERO_GAME_ID].id, ACTIVE_HERO_GAME_ID);
  assert.equal(HERO_GAMES["tiny-garden"].presentation, "embedded");
});

test("registry selection invokes only the selected engine loader", async () => {
  const loaded: string[] = [];
  const createDefinition = (id: string): HeroGameDefinition => ({
    id,
    name: id,
    ariaLabel: `${id} game`,
    errorMessage: "Could not load",
    presentation: "embedded",
    capabilities: { sound: false, pauseOffscreen: true, touchFullscreen: false },
    transition: { revealMs: 0, exitMs: 0 },
    load: async () => {
      loaded.push(id);
      return { default: () => null };
    },
  });
  const registry = { first: createDefinition("first"), second: createDefinition("second") };
  const selected = selectHeroGame(registry, "second");
  assert.deepEqual(loaded, []);
  await selected.load();
  assert.deepEqual(loaded, ["second"]);
});

test("the neutral lifecycle handles loading, reveal, play, exit, failure, and retry", () => {
  let phase = reduceHeroGamePhase("preview", { type: "play", ready: false });
  assert.equal(phase, "loading");
  phase = reduceHeroGamePhase(phase, { type: "ready", playRequested: true });
  assert.equal(phase, "revealing");
  phase = reduceHeroGamePhase(phase, { type: "revealed" });
  assert.equal(phase, "active");
  phase = reduceHeroGamePhase(phase, { type: "exit" });
  assert.equal(phase, "exiting");
  phase = reduceHeroGamePhase(phase, { type: "exited" });
  assert.equal(phase, "preview");
  phase = reduceHeroGamePhase(phase, { type: "error" });
  assert.equal(phase, "error");
  assert.equal(reduceHeroGamePhase(phase, { type: "retry" }), "preview");
});

test("irrelevant lifecycle events cannot overwrite the current game state", () => {
  assert.equal(reduceHeroGamePhase("active", { type: "ready", playRequested: false }), "active");
  assert.equal(reduceHeroGamePhase("preview", { type: "revealed" }), "preview");
  assert.equal(reduceHeroGamePhase("loading", { type: "ready", playRequested: false }), "loading");
});

test("the shared host pauses active games for visibility without assuming an engine", () => {
  assert.equal(shouldPauseHeroGame({ phase: "active", inViewport: false, documentVisible: true, pauseOffscreen: true }), true);
  assert.equal(shouldPauseHeroGame({ phase: "active", inViewport: true, documentVisible: false, pauseOffscreen: true }), true);
  assert.equal(shouldPauseHeroGame({ phase: "preview", inViewport: false, documentVisible: false, pauseOffscreen: true }), false);
  assert.equal(shouldPauseHeroGame({ phase: "active", inViewport: false, documentVisible: true, pauseOffscreen: false }), false);
  assert.equal(isHeroGameImmersive("exiting"), true);
  assert.equal(isHeroGameImmersive("preview"), false);
});

test("core contracts contain no Phaser or pixel-fighter domain leakage", () => {
  const coreTypes = readFileSync(new URL("../src/games/core/types.ts", import.meta.url), "utf8");
  for (const forbidden of ["Phaser", "CharacterId", "InputState", "HudState", "MatchResult", "TinyGardenState", "SeedId"]) {
    assert.equal(coreTypes.includes(forbidden), false, `${forbidden} leaked into the shared game contract`);
  }
});

test("embedded games do not opt into immersive document behavior", () => {
  const shell = readFileSync(new URL("../src/games/core/hero-game-shell.tsx", import.meta.url), "utf8");
  const globalStyles = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.ok(shell.includes('definition.presentation === "immersive" && isHeroGameImmersive(phase)'));
  assert.ok(globalStyles.includes('.hero-game-shell[data-presentation="immersive"].is-active'));
  assert.equal(globalStyles.includes("\n.hero-game-shell.is-active {\n  position: fixed"), false);
});

test("none mode ships aligned responsive day and night artwork with decorative celestial layers", () => {
  const shell = readFileSync(new URL("../src/games/core/hero-game-shell.tsx", import.meta.url), "utf8");
  const globalStyles = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

  for (const asset of [
    "hero_none_apocalypse_pixel_background.png",
    "hero_none_apocalypse_pixel_background_mobile.png",
    "hero_none_apocalypse_pixel_background_dark.png",
    "hero_none_apocalypse_pixel_background_mobile_dark.png",
    "hero_none_pixel_sun.png",
    "hero_none_pixel_moon.png",
  ]) {
    assert.ok(shell.includes(asset), `${asset} is not rendered by none mode`);
  }

  assert.ok(shell.includes('className="hero-none-backgrounds" aria-hidden="true"'));
  assert.ok(shell.includes('className="hero-none-celestial-layer" aria-hidden="true"'));
  assert.ok(globalStyles.includes(':root[data-theme="dark"] .hero-none-bg-layer-dark { opacity: 1; }'));
  assert.ok(globalStyles.includes(':root:not([data-theme="light"]) .hero-none-bg-layer-dark { opacity: 1; }'));
  assert.ok(globalStyles.includes("@media (prefers-reduced-motion: reduce)"));
});
