import assert from "node:assert/strict";
import test from "node:test";
import {
  actionHint,
  BOAT_DOCK_X,
  BOAT_MAX_X,
  BOAT_MIN_X,
  canBoard,
  canDisembark,
  CATCH_TABLES,
  CATCHES,
  chooseCatch,
  chooseWaitMs,
  createInitialFishingState,
  DEEP_MIN_X,
  FISHING_TIMING,
  HAUL_LIMIT,
  PIER_MAX_X,
  PIER_MIN_X,
  reduceFishingState,
  zoneForPosition,
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

function castFrom(state: FishingState, random = 0) {
  return reduceFishingState(state, { type: "cast", random });
}

function reachBite(state: FishingState, random = 0) {
  let next = castFrom(state, random);
  next = tick(next, FISHING_TIMING.castingMs);
  return tick(next, next.waitMs, random);
}

function reelToCatch(state: FishingState, random = 0) {
  let guard = 0;
  while (state.activity === "reeling" && guard < 60) {
    state = reduceFishingState(state, { type: "press" });
    state = tick(state, 500, random);
    state = reduceFishingState(state, { type: "release" });
    state = tick(state, 300, random);
    guard += 1;
  }
  return state;
}

function catchOneFish(state: FishingState, random = 0) {
  state = reachBite(state, random);
  state = reduceFishingState(state, { type: "press" });
  state = reelToCatch(state, random);
  return tick(state, FISHING_TIMING.resultMs);
}

function walkToBoat(state: FishingState) {
  state = reduceFishingState(state, { type: "moveStart", direction: 1 });
  state = tick(state, 4_000);
  return reduceFishingState(state, { type: "moveStop" });
}

test("the fishing loop follows the explicit phase order", () => {
  let state = castFrom(createInitialFishingState());
  assert.equal(state.activity, "casting");
  state = tick(state, FISHING_TIMING.castingMs);
  assert.equal(state.activity, "waiting");
  state = tick(state, state.waitMs);
  assert.equal(state.activity, "fishBiting");
  state = reduceFishingState(state, { type: "press" });
  assert.equal(state.activity, "reeling");
  state = reelToCatch(state);
  assert.equal(state.activity, "landed");
  assert.equal(state.escaped, false);
  assert.ok(state.lastCatch);
  assert.equal(tick(state, FISHING_TIMING.resultMs).activity, "idle");
});

test("waiting time stays within the calm randomized window", () => {
  assert.equal(chooseWaitMs(-1), FISHING_TIMING.waitMinMs);
  assert.ok(chooseWaitMs(0.5) > FISHING_TIMING.waitMinMs);
  assert.ok(chooseWaitMs(1) < FISHING_TIMING.waitMaxMs);
});

test("missing the bite escapes and returns to idle", () => {
  const bite = reachBite(createInitialFishingState());
  const escaped = tick(bite, FISHING_TIMING.biteMs);
  assert.equal(escaped.activity, "landed");
  assert.equal(escaped.escaped, true);
  assert.equal(tick(escaped, FISHING_TIMING.resultMs).activity, "idle");
});

test("holding without easing snaps the line", () => {
  let state = reduceFishingState(reachBite(createInitialFishingState(), 0.1), { type: "press" });
  state = tick(state, 3_000);
  assert.equal(state.activity, "landed");
  assert.equal(state.escaped, true);
  assert.equal(state.tension, 100);
});

test("releasing lowers tension without losing catch progress", () => {
  let state = reduceFishingState(reachBite(createInitialFishingState(), 0.1), { type: "press" });
  state = tick(state, 1_000);
  const progress = state.progress;
  const tension = state.tension;
  state = reduceFishingState(state, { type: "release" });
  state = tick(state, 500);
  assert.equal(state.progress, progress);
  assert.ok(state.tension < tension);
});

test("a stalled reel escapes at the session timeout", () => {
  let state = reduceFishingState(reachBite(createInitialFishingState(), 0.1), { type: "press" });
  state = reduceFishingState(state, { type: "release" });
  state = tick(state, FISHING_TIMING.reelingMs);
  assert.equal(state.activity, "landed");
  assert.equal(state.escaped, true);
});

test("walking is clamped to the pier and flips facing", () => {
  let state = reduceFishingState(createInitialFishingState(), { type: "moveStart", direction: -1 });
  assert.equal(state.activity, "walking");
  assert.equal(state.facing, -1);
  state = tick(state, 10_000);
  assert.equal(state.playerX, PIER_MIN_X);
  state = reduceFishingState(state, { type: "moveStart", direction: 1 });
  assert.equal(state.facing, 1);
  state = tick(state, 20_000);
  assert.equal(state.playerX, PIER_MAX_X);
  state = reduceFishingState(state, { type: "moveStop" });
  assert.equal(state.activity, "idle");
});

test("boarding requires the boat nearby and works while walking past it", () => {
  let state = createInitialFishingState();
  assert.equal(canBoard(state), false);
  assert.equal(reduceFishingState(state, { type: "interact" }), state);

  state = reduceFishingState(state, { type: "moveStart", direction: 1 });
  state = tick(state, 3_500);
  assert.equal(state.activity, "walking");
  assert.equal(canBoard(state), true);
  state = reduceFishingState(state, { type: "interact" });
  assert.equal(state.location, "boat");
  assert.equal(state.activity, "idle");
  assert.equal(actionHint(state), "disembark");
});

test("disembarking returns the angler to the pier", () => {
  let state = walkToBoat(createInitialFishingState());
  state = reduceFishingState(state, { type: "interact" });
  assert.equal(state.location, "boat");
  assert.equal(canDisembark(state), true);
  state = reduceFishingState(state, { type: "interact" });
  assert.equal(state.location, "pier");
  assert.equal(state.activity, "idle");
  assert.ok(state.playerX <= PIER_MAX_X && state.playerX >= PIER_MIN_X);
});

test("rowing is clamped to the lake and disembark requires the dock side", () => {
  let state = walkToBoat(createInitialFishingState());
  state = reduceFishingState(state, { type: "interact" });
  state = reduceFishingState(state, { type: "moveStart", direction: 1 });
  assert.equal(state.activity, "rowing");
  state = tick(state, 1_000);
  assert.equal(canDisembark(state), false);
  state = tick(state, 30_000);
  assert.equal(state.boatX, BOAT_MAX_X);
  state = reduceFishingState(state, { type: "moveStart", direction: -1 });
  state = tick(state, 60_000);
  assert.equal(state.boatX, BOAT_MIN_X);
});

test("the boat stays where it was left while the angler is on the pier", () => {
  let state = walkToBoat(createInitialFishingState());
  state = reduceFishingState(state, { type: "interact" });
  state = reduceFishingState(state, { type: "moveStart", direction: 1 });
  state = tick(state, 500);
  state = reduceFishingState(state, { type: "moveStop" });
  const parkedBoatX = state.boatX;
  state = reduceFishingState(state, { type: "interact" });
  assert.equal(state.location, "pier");
  state = tick(state, 1_000);
  assert.equal(state.boatX, parkedBoatX);
});

test("movement and casting are mutually exclusive", () => {
  let state = reduceFishingState(createInitialFishingState(), { type: "moveStart", direction: 1 });
  assert.equal(reduceFishingState(state, { type: "cast", random: 0 }), state);
  state = reduceFishingState(state, { type: "moveStop" });
  const casting = castFrom(state);
  assert.equal(casting.activity, "casting");
  assert.equal(reduceFishingState(casting, { type: "moveStart", direction: 1 }), casting);
});

test("zones follow position: pier is shore, deep starts at the boundary", () => {
  assert.equal(zoneForPosition("pier", PIER_MIN_X), "shore");
  assert.equal(zoneForPosition("pier", PIER_MAX_X), "shore");
  assert.equal(zoneForPosition("boat", BOAT_MIN_X), "mid");
  assert.equal(zoneForPosition("boat", DEEP_MIN_X - 1), "mid");
  assert.equal(zoneForPosition("boat", DEEP_MIN_X), "deep");
  assert.equal(zoneForPosition("boat", BOAT_MAX_X), "deep");
});

test("casting records the zone of the cast position", () => {
  const pierCast = castFrom(createInitialFishingState());
  assert.equal(pierCast.zone, "shore");

  let state = walkToBoat(createInitialFishingState());
  state = reduceFishingState(state, { type: "interact" });
  state = reduceFishingState(state, { type: "moveStart", direction: 1 });
  state = tick(state, 10_000);
  state = reduceFishingState(state, { type: "moveStop" });
  const boatCast = castFrom(state);
  assert.equal(boatCast.zone, "deep");
});

test("catch tables are zone-scoped and weights normalize", () => {
  const shoreIds = new Set(CATCH_TABLES.shore.map((entry) => entry.id));
  const deepIds = new Set(CATCH_TABLES.deep.map((entry) => entry.id));
  assert.ok(shoreIds.has("junk-barrel"));
  assert.ok(shoreIds.has("junk-box"));
  assert.equal(shoreIds.has("treasure-chest"), false);
  assert.equal(shoreIds.has("lake-shark"), false);
  assert.ok(deepIds.has("lake-shark"));
  assert.ok(deepIds.has("treasure-chest"));
  assert.equal(deepIds.has("junk-barrel"), false);

  assert.equal(chooseCatch("shore", 0).id, "pond-minnow");
  assert.equal(chooseCatch("shore", 0.999).id, "junk-box");
  assert.equal(chooseCatch("deep", 0).id, "silver-dace");
  assert.equal(chooseCatch("deep", 0.999).id, "treasure-chest");
  assert.equal(chooseCatch("deep", 0.9).id, "lake-shark");
  for (const catchDef of CATCHES) {
    assert.ok(catchDef.tensionMultiplier > 0);
    assert.ok(catchDef.sprite.startsWith("/assets/games/fishing/catch/"));
  }
});

test("the hooked catch is rolled when the bite begins", () => {
  const biting = reachBite(createInitialFishingState(), 0.9);
  assert.equal(biting.activity, "fishBiting");
  assert.ok(biting.hooked);
  assert.equal(biting.hooked?.id, chooseCatch("shore", 0.9).id);
});

test("huge fish snap the line faster than tiny fish with the same input", () => {
  const hugeBite = reachBite(createInitialFishingState(), 0.1);
  const huge = reduceFishingState({ ...hugeBite, hooked: { ...hugeBite.hooked!, tensionMultiplier: 1.3 } }, { type: "press" });
  const tinyBite = reachBite(createInitialFishingState(), 0.1);
  const tiny = reduceFishingState({ ...tinyBite, hooked: { ...tinyBite.hooked!, tensionMultiplier: 0.8 } }, { type: "press" });

  const hugeAfter = tick(huge, 1_800);
  const tinyAfter = tick(tiny, 1_800);
  assert.equal(hugeAfter.activity, "landed");
  assert.equal(hugeAfter.escaped, true);
  assert.equal(tinyAfter.activity, "reeling");
});

test("haul records catches, junk counts, caps at the limit, and reset clears it", () => {
  let state = createInitialFishingState();
  for (let index = 0; index < HAUL_LIMIT + 2; index += 1) {
    state = catchOneFish(state, 0.1);
    assert.equal(state.activity, "idle");
  }
  assert.equal(state.haul.length, HAUL_LIMIT);
  assert.ok(state.haul.every((id) => id === "pond-minnow"));

  state = reduceFishingState(state, { type: "reset" });
  assert.deepEqual(state.haul, []);
  assert.equal(state.location, "pier");
  assert.equal(state.boatX, BOAT_DOCK_X);
});

test("escapes keep the existing haul", () => {
  const state = catchOneFish(createInitialFishingState(), 0.1);
  assert.equal(state.haul.length, 1);
  const bite = reachBite(state, 0.1);
  const escaped = tick(bite, FISHING_TIMING.biteMs);
  assert.equal(escaped.escaped, true);
  assert.equal(escaped.haul.length, 1);
});

test("irrelevant input cannot skip fishing phases", () => {
  const idle = createInitialFishingState();
  assert.equal(reduceFishingState(idle, { type: "press" }), idle);
  const waiting = tick(castFrom(idle), FISHING_TIMING.castingMs);
  assert.equal(reduceFishingState(waiting, { type: "cast", random: 1 }), waiting);
  assert.equal(reduceFishingState(waiting, { type: "interact" }), waiting);
  const reeling = reduceFishingState(tick(waiting, waiting.waitMs), { type: "press" });
  assert.equal(reduceFishingState(reeling, { type: "moveStart", direction: 1 }), reeling);
});

test("action hints stay contextual to location and activity", () => {
  const idle = createInitialFishingState();
  assert.equal(actionHint(idle), "cast");
  const walking = reduceFishingState(idle, { type: "moveStart", direction: 1 });
  assert.equal(actionHint(walking), "none");
  const casting = castFrom(idle);
  assert.equal(actionHint(casting), "wait");
  const biting = reachBite(idle, 0.1);
  assert.equal(actionHint(biting), "hook");
  const reeling = reduceFishingState(biting, { type: "press" });
  assert.equal(actionHint(reeling), "reel");
});
