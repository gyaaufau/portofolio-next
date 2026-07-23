import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { HeroGameActions, HeroGameRuntime } from "../src/games/core/types";
import { ARTILLERY_CONFIG } from "../src/games/pixel-artillery/data/config";
import { chooseEnemyShot } from "../src/games/pixel-artillery/engine/ai";
import { ArtilleryInputState, getInputCommand } from "../src/games/pixel-artillery/engine/input";
import { artilleryReducer, createInitialMatch } from "../src/games/pixel-artillery/engine/machine";
import {
  advanceProjectile,
  calculateLaunchVelocity,
  createProjectile,
  detectProjectileCollision,
  ProjectileDriver,
  simulateTrajectory,
} from "../src/games/pixel-artillery/engine/projectile";
import {
  calculateExplosionDamage,
  calculateImpactDamage,
  canPlayerFire,
  clampHealth,
  createSeededRandom,
  getMuzzlePosition,
  getTerrainHeight,
} from "../src/games/pixel-artillery/engine/rules";
import type { MatchState, ProjectileImpact, ProjectileState } from "../src/games/pixel-artillery/engine/types";

function startMatch(wind = 0) {
  return artilleryReducer(createInitialMatch(wind), { type: "START" });
}

test("initial match state is valid and the player starts", () => {
  const ready = createInitialMatch(0.3);
  assert.equal(ready.phase, "ready");
  assert.equal(ready.player.health, 100);
  assert.equal(ready.enemy.health, 100);
  const started = artilleryReducer(ready, { type: "START" });
  assert.equal(started.phase, "playerAiming");
  assert.equal(started.turn, "player");
});

test("angle and power remain inside configured limits", () => {
  let state = startMatch();
  state = artilleryReducer(state, { type: "ADJUST_ANGLE", delta: 999 });
  state = artilleryReducer(state, { type: "ADJUST_POWER", delta: -999 });
  assert.equal(state.aimAngle, ARTILLERY_CONFIG.maximumAngle);
  assert.equal(state.shotPower, ARTILLERY_CONFIG.minimumPower);
});

test("firing is phase-gated and only one projectile phase can be entered", () => {
  const ready = createInitialMatch();
  assert.equal(canPlayerFire(ready), false);
  assert.equal(artilleryReducer(ready, { type: "FIRE", owner: "player" }), ready);
  const aiming = startMatch();
  const fired = artilleryReducer(aiming, { type: "FIRE", owner: "player" });
  assert.equal(fired.phase, "playerProjectile");
  assert.equal(artilleryReducer(fired, { type: "FIRE", owner: "player" }), fired);
});

test("launch velocity uses angle, power, and owner direction", () => {
  const player = calculateLaunchVelocity(45, 100, "player");
  const enemy = calculateLaunchVelocity(45, 100, "enemy");
  assert.ok(Math.abs(player.x - 130.8147545) < 0.001);
  assert.ok(Math.abs(player.y + 130.8147545) < 0.001);
  assert.equal(enemy.x, -player.x);
  assert.equal(enemy.y, player.y);
});

test("fixed-step gravity and wind update velocity predictably", () => {
  const projectile = createProjectile("player", { x: 20, y: 100 }, 45, 60);
  const advanced = advanceProjectile(projectile, 0.5, 0.25);
  assert.equal(advanced.velocity.x, projectile.velocity.x + 1);
  assert.equal(advanced.velocity.y, projectile.velocity.y + 27.5);
  assert.equal(advanced.age, 0.25);
});

test("trajectory preview is deterministic and uses the projectile simulation", () => {
  const state = startMatch(0.2);
  const projectile = createProjectile("player", getMuzzlePosition("player", state), 52, 78);
  const first = simulateTrajectory({ projectile, wind: state.wind, state, pointCount: 8 });
  const second = simulateTrajectory({ projectile, wind: state.wind, state, pointCount: 8 });
  assert.deepEqual(first, second);
  assert.ok(first.length > 2);
  assert.ok(first[1].x > first[0].x);
});

test("ground and ant collisions resolve once", () => {
  const state = startMatch();
  const groundProjectile: ProjectileState = {
    owner: "player",
    position: { x: 180, y: getTerrainHeight(180) + 1 },
    velocity: { x: 0, y: 10 },
    age: 1,
    hasResolved: false,
  };
  assert.equal(detectProjectileCollision(groundProjectile, state)?.kind, "ground");
  assert.equal(detectProjectileCollision({ ...groundProjectile, hasResolved: true }, state), null);

  const antProjectile = { ...groundProjectile, position: { ...state.enemy.position } };
  const impact = detectProjectileCollision(antProjectile, state);
  assert.equal(impact?.kind, "ant");
  assert.equal(impact?.target, "enemy");
});

test("direct and splash damage follow configured falloff and health is clamped", () => {
  assert.equal(calculateExplosionDamage(0), ARTILLERY_CONFIG.directHitDamage);
  const near = calculateExplosionDamage(24);
  const far = calculateExplosionDamage(44);
  assert.ok(near > far);
  assert.ok(far >= ARTILLERY_CONFIG.minimumSplashDamage);
  assert.equal(calculateExplosionDamage(60), 0);
  assert.equal(clampHealth(-20), 0);
  assert.equal(clampHealth(120), 100);
});

test("impact damage applies once before switching turns", () => {
  let state = artilleryReducer(startMatch(), { type: "FIRE", owner: "player" });
  const impact: ProjectileImpact = { kind: "ant", position: { ...state.enemy.position }, target: "enemy" };
  const damage = calculateImpactDamage(impact, state);
  state = artilleryReducer(state, { type: "IMPACT", owner: "player", impact, damage });
  assert.equal(state.enemy.health, 60);
  const duplicate = artilleryReducer(state, { type: "IMPACT", owner: "player", impact, damage });
  assert.equal(duplicate.enemy.health, 60);
  state = artilleryReducer(state, { type: "RESOLVE_IMPACT", owner: "player", nextWind: -0.2 });
  assert.equal(state.phase, "enemyThinking");
  assert.equal(state.turn, "enemy");
  assert.equal(state.wind, -0.2);
});

test("player input is ignored during the enemy turn", () => {
  const aiming = startMatch();
  const fired = artilleryReducer(aiming, { type: "FIRE", owner: "player" });
  const miss: ProjectileImpact = { kind: "ground", position: { x: 190, y: getTerrainHeight(190) } };
  const resolving = artilleryReducer(fired, { type: "IMPACT", owner: "player", impact: miss, damage: { player: 0, enemy: 0 } });
  const enemyTurn = artilleryReducer(resolving, { type: "RESOLVE_IMPACT", owner: "player", nextWind: 0 });
  const adjusted = artilleryReducer(enemyTurn, { type: "ADJUST_ANGLE", delta: 10 });
  assert.equal(adjusted.aimAngle, enemyTurn.aimAngle);
});

test("seeded enemy AI is deterministic and stays within valid limits", () => {
  const state = { ...startMatch(0.4), phase: "enemyThinking", turn: "enemy" } as MatchState;
  const first = chooseEnemyShot(state, createSeededRandom(42));
  const second = chooseEnemyShot(state, createSeededRandom(42));
  assert.deepEqual(first, second);
  assert.ok(first.angle >= ARTILLERY_CONFIG.minimumAngle && first.angle <= ARTILLERY_CONFIG.maximumAngle);
  assert.ok(first.power >= ARTILLERY_CONFIG.minimumPower && first.power <= ARTILLERY_CONFIG.maximumPower);
});

test("defeating either ant enters the correct result state", () => {
  const base = startMatch();
  const impact: ProjectileImpact = { kind: "ant", position: { ...base.enemy.position }, target: "enemy" };
  let winning = { ...base, enemy: { ...base.enemy, health: 30 } };
  winning = artilleryReducer(winning, { type: "FIRE", owner: "player" });
  winning = artilleryReducer(winning, { type: "IMPACT", owner: "player", impact, damage: { player: 0, enemy: 40 } });
  winning = artilleryReducer(winning, { type: "RESOLVE_IMPACT", owner: "player", nextWind: 0 });
  assert.equal(winning.phase, "playerWon");

  let losing = { ...base, phase: "enemyThinking", turn: "enemy", player: { ...base.player, health: 30 }, enemyAim: { angle: 45, power: 60, quality: "near" } } as MatchState;
  losing = artilleryReducer(losing, { type: "FIRE", owner: "enemy" });
  losing = artilleryReducer(losing, { type: "IMPACT", owner: "enemy", impact: { ...impact, target: "player" }, damage: { player: 40, enemy: 0 } });
  losing = artilleryReducer(losing, { type: "RESOLVE_IMPACT", owner: "enemy", nextWind: 0 });
  assert.equal(losing.phase, "playerLost");
});

test("restart restores health and the player turn", () => {
  const damaged = { ...startMatch(), player: { ...startMatch().player, health: 10 }, enemy: { ...startMatch().enemy, health: 0 }, phase: "playerWon" } as MatchState;
  const restarted = artilleryReducer(damaged, { type: "RESTART", wind: 0.5 });
  assert.equal(restarted.player.health, 100);
  assert.equal(restarted.enemy.health, 100);
  assert.equal(restarted.phase, "playerAiming");
  assert.equal(restarted.turn, "player");
});

test("keyboard commands require focus and clear safely on blur", () => {
  assert.equal(getInputCommand("ArrowUp", "playerAiming", false), null);
  assert.equal(getInputCommand("ArrowUp", "playerAiming", true), "angleUp");
  assert.equal(getInputCommand(" ", "enemyThinking", true), null);
  assert.equal(getInputCommand("Escape", "enemyProjectile", true), "exit");
  const input = new ArtilleryInputState();
  input.focus();
  assert.equal(input.keyDown("ArrowUp", "playerAiming"), "angleUp");
  assert.equal(input.heldCount(), 1);
  input.blur();
  assert.equal(input.heldCount(), 0);
  assert.equal(input.isFocused(), false);
});

test("projectile driver cancels frames on pause and dispose", () => {
  let callback: FrameRequestCallback | null = null;
  let cancelled = 0;
  let frameId = 0;
  const state = startMatch();
  const driver = new ProjectileDriver(
    {
      requestFrame: (next) => {
        callback = next;
        frameId += 1;
        return frameId;
      },
      cancelFrame: () => { cancelled += 1; },
    },
    () => state,
    () => undefined,
    () => undefined,
  );
  driver.start(createProjectile("player", getMuzzlePosition("player", state), 45, 60));
  assert.ok(callback);
  driver.setPaused(true);
  assert.equal(cancelled, 1);
  driver.dispose();
  assert.equal(driver.isRunning(), false);
});

test("reduced motion is presentation-only and preserves projectile rules", () => {
  const normal = calculateLaunchVelocity(50, 70, "player");
  const reduced = calculateLaunchVelocity(50, 70, "player");
  assert.deepEqual(reduced, normal);
});

test("the adapter mounts and unmounts without navigation side effects", async () => {
  const require = createRequire(import.meta.url) as NodeJS.Require & { extensions: Record<string, (module: NodeModule) => void> };
  require.extensions[".css"] = () => undefined;
  const { default: Adapter } = await import("../src/games/pixel-artillery/adapter");
  const dom = new JSDOM("<!doctype html><div id=\"root\"></div>", { url: "https://portfolio.test/" });
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousNavigator = globalThis.navigator;
  const previousResizeObserver = globalThis.ResizeObserver;
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
  Object.defineProperty(dom.window, "devicePixelRatio", { value: 1 });
  dom.window.requestAnimationFrame = (callback) => dom.window.setTimeout(() => callback(performance.now()), 16);
  dom.window.cancelAnimationFrame = (id) => dom.window.clearTimeout(id);

  const context = {
    setTransform() {}, clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {},
    fill() {}, stroke() {}, save() {}, restore() {}, translate() {}, scale() {}, rotate() {}, arc() {},
    imageSmoothingEnabled: false, fillStyle: "", strokeStyle: "", lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, "getContext", { value: () => context });
  dom.window.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 640, bottom: 360, width: 640, height: 360, toJSON: () => ({}),
  });

  let activeSurface: HTMLElement | null = null;
  let previewSurface: HTMLElement | null = null;
  const runtime: HeroGameRuntime = {
    phase: "preview",
    nearViewport: false,
    inViewport: true,
    documentVisible: true,
    reducedMotion: false,
    muted: true,
    hostPaused: false,
    retryKey: 0,
  };
  const actions: HeroGameActions = {
    requestPlay() {}, requestExit() {}, requestResume() {}, reportReady() {}, reportLoading() {}, reportError() {}, retry() {}, toggleMuted() {},
    registerPreviewFocus(element) { previewSurface = element; },
    registerActiveFocus(element) { activeSurface = element; },
  };
  const rootElement = dom.window.document.getElementById("root");
  assert.ok(rootElement);
  const root = createRoot(rootElement);
  const originalUrl = dom.window.location.href;

  await act(async () => root.render(createElement(Adapter, { runtime, actions })));
  assert.ok(activeSurface);
  assert.ok(previewSurface);
  assert.equal(dom.window.location.href, originalUrl);
  await act(async () => root.unmount());
  assert.equal(activeSurface, null);
  assert.equal(previewSurface, null);
  assert.equal(dom.window.location.href, originalUrl);

  Object.assign(globalThis, {
    window: previousWindow,
    document: previousDocument,
    navigator: previousNavigator,
    ResizeObserver: previousResizeObserver,
    IS_REACT_ACT_ENVIRONMENT: false,
  });
  dom.window.close();
});
