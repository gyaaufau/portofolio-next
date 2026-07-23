import assert from "node:assert/strict";
import test from "node:test";
import {
  FISH,
  FISHING_TIMING,
  chooseFish,
  chooseWaitMs,
  createInitialFishingState,
  reduceFishingState,
  type FishingState,
} from "../src/games/pixel-fishing/domain/state";

function tick(state: FishingState, milliseconds: number, random = 0) {
  let remaining = milliseconds;
  while (remaining > 0) {
    const deltaMs = Math.min(100, remaining);
    state = reduceFishingState(state, { type: "tick", deltaMs, random });
    remaining -= deltaMs;
  }
  return state;
}

function reachBite(random = 0) {
  let state = reduceFishingState(createInitialFishingState(), { type: "cast", random });
  state = tick(state, FISHING_TIMING.castingMs);
  return tick(state, state.waitMs);
}

test("the fishing loop follows the explicit phase order", () => {
  let state = reduceFishingState(createInitialFishingState(), { type: "cast", random: 0 });
  assert.equal(state.phase, "casting");
  state = tick(state, FISHING_TIMING.castingMs);
  assert.equal(state.phase, "waiting");
  state = tick(state, state.waitMs);
  assert.equal(state.phase, "fishBiting");
  state = reduceFishingState(state, { type: "press" });
  assert.equal(state.phase, "reeling");

  state = tick(state, 1_500);
  state = reduceFishingState(state, { type: "release" });
  state = tick(state, 1_000);
  state = reduceFishingState(state, { type: "press" });
  state = tick(state, 1_500);
  state = reduceFishingState(state, { type: "release" });
  state = tick(state, 1_000);
  state = reduceFishingState(state, { type: "press" });
  state = tick(state, 600, 0.7);
  assert.equal(state.phase, "caught");
  assert.equal(state.fish?.id, "tiny-koi");
  assert.equal(tick(state, FISHING_TIMING.resultMs).phase, "idle");
});

test("waiting time stays within the calm randomized window", () => {
  assert.equal(chooseWaitMs(-1), FISHING_TIMING.waitMinMs);
  assert.ok(chooseWaitMs(0.5) > FISHING_TIMING.waitMinMs);
  assert.ok(chooseWaitMs(1) < FISHING_TIMING.waitMaxMs);
});

test("missing the bite escapes and returns to idle", () => {
  const bite = reachBite();
  const escaped = tick(bite, FISHING_TIMING.biteMs);
  assert.equal(escaped.phase, "escaped");
  assert.equal(tick(escaped, FISHING_TIMING.resultMs).phase, "idle");
});

test("holding without easing snaps the line", () => {
  let state = reduceFishingState(reachBite(), { type: "press" });
  state = tick(state, 2_200);
  assert.equal(state.phase, "escaped");
  assert.equal(state.tension, 100);
});

test("releasing lowers tension without losing catch progress", () => {
  let state = reduceFishingState(reachBite(), { type: "press" });
  state = tick(state, 1_000);
  const progress = state.progress;
  const tension = state.tension;
  state = reduceFishingState(state, { type: "release" });
  state = tick(state, 500);
  assert.equal(state.progress, progress);
  assert.ok(state.tension < tension);
});

test("a stalled reel escapes at the session timeout", () => {
  let state = reduceFishingState(reachBite(), { type: "press" });
  state = reduceFishingState(state, { type: "release" });
  state = tick(state, FISHING_TIMING.reelingMs);
  assert.equal(state.phase, "escaped");
});

test("fish results are flavor-only members of the fixed list", () => {
  assert.deepEqual(FISH.map(({ id }) => id), ["bluegill", "river-perch", "tiny-koi", "golden-carp"]);
  assert.equal(chooseFish(0).id, "bluegill");
  assert.equal(chooseFish(0.3).id, "river-perch");
  assert.equal(chooseFish(0.6).id, "tiny-koi");
  assert.equal(chooseFish(0.99).id, "golden-carp");
});

test("irrelevant input cannot skip fishing phases", () => {
  const idle = createInitialFishingState();
  assert.equal(reduceFishingState(idle, { type: "press" }), idle);
  const waiting = tick(reduceFishingState(idle, { type: "cast", random: 0 }), FISHING_TIMING.castingMs);
  assert.equal(reduceFishingState(waiting, { type: "cast", random: 1 }), waiting);
});
