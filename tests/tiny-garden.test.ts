import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createInitialTinyGardenState, reduceTinyGardenState } from "../src/games/tiny-garden/domain/reducer";
import { GARDEN_BOUNDS, canPlant, canWater, isGardenComplete, isNearSoil } from "../src/games/tiny-garden/domain/rules";
import { gardenKeyDownCommand, gardenKeyUpCommand } from "../src/games/tiny-garden/engine/input";
import { createTinyGardenRuntime, type TinyGardenController, type TinyGardenScheduler } from "../src/games/tiny-garden/engine/runtime";

class FakeScheduler implements TinyGardenScheduler {
  time = 0;
  nextId = 1;
  frames = new Map<number, FrameRequestCallback>();
  cancelled: number[] = [];

  now = () => this.time;
  requestFrame = (callback: FrameRequestCallback) => {
    const id = this.nextId++;
    this.frames.set(id, callback);
    return id;
  };
  cancelFrame = (frame: number) => {
    this.cancelled.push(frame);
    this.frames.delete(frame);
  };
  step(milliseconds = 100) {
    this.time += milliseconds;
    const callbacks = [...this.frames.values()];
    this.frames.clear();
    for (const callback of callbacks) callback(this.time);
  }
}

function createRuntime(reducedMotion = false, random = () => 0) {
  const scheduler = new FakeScheduler();
  const controller = createTinyGardenRuntime({
    reducedMotion,
    random,
    scheduler,
    render: () => undefined,
    onChange: () => undefined,
  });
  return { controller, scheduler };
}

function advance(scheduler: FakeScheduler, milliseconds: number) {
  for (let elapsed = 0; elapsed < milliseconds; elapsed += 100) scheduler.step(100);
}

function moveNearSoil(controller: TinyGardenController, scheduler: FakeScheduler) {
  controller.move(1);
  advance(scheduler, 3_000);
  controller.stopMoving();
  assert.equal(isNearSoil(controller.getState().characterPosition), true);
}

function preparePlantedGarden(controller: TinyGardenController, scheduler: FakeScheduler) {
  controller.setInteractive(true);
  controller.confirmSeed();
  moveNearSoil(controller, scheduler);
  controller.action();
  advance(scheduler, 1_200);
  assert.equal(controller.getState().phase, "planted");
}

test("initial state is a valid empty, inactive garden", () => {
  const state = createInitialTinyGardenState();
  assert.equal(state.phase, "idle");
  assert.equal(state.selectedSeedId, "sunflower");
  assert.equal(state.soilState, "empty");
  assert.equal(state.growthStage, 0);
  assert.equal(canPlant(state), false);
  assert.equal(canWater(state), false);
});

test("seed selection cycles, selects directly, and confirms into carrying state", () => {
  let state = reduceTinyGardenState(createInitialTinyGardenState(), { type: "activate", random: 0.4 });
  state = reduceTinyGardenState(state, { type: "cycleSeed", direction: 1 });
  assert.equal(state.selectedSeedId, "tiny-flower");
  state = reduceTinyGardenState(state, { type: "selectSeed", seedId: "little-bush" });
  state = reduceTinyGardenState(state, { type: "confirmSeed" });
  assert.equal(state.phase, "carryingSeed");
  assert.equal(state.selectedSeedId, "little-bush");
});

test("planting is proximity-gated and cannot plant twice", () => {
  const { controller, scheduler } = createRuntime();
  controller.setInteractive(true);
  controller.confirmSeed();
  controller.action();
  assert.equal(controller.getState().phase, "carryingSeed");
  moveNearSoil(controller, scheduler);
  controller.action();
  assert.equal(controller.getState().phase, "planting");
  controller.action();
  assert.equal(controller.getState().phase, "planting");
  advance(scheduler, 1_200);
  assert.equal(controller.getState().soilState, "planted");
});

test("watering is only allowed after planting and advances growth exactly three times", () => {
  const { controller, scheduler } = createRuntime(false, () => 0.99);
  controller.setInteractive(true);
  controller.confirmSeed();
  moveNearSoil(controller, scheduler);
  assert.equal(canWater(controller.getState()), false);
  controller.action();
  advance(scheduler, 1_200);

  for (let watering = 1; watering <= 3; watering += 1) {
    controller.action();
    assert.equal(controller.getState().phase, "watering");
    advance(scheduler, 2_100);
    assert.equal(controller.getState().wateringCount, watering);
  }

  const completed = controller.getState();
  assert.equal(completed.phase, "bloomed");
  assert.equal(completed.growthStage, 4);
  assert.equal(completed.resultMessage, "You touched grass.");
  assert.equal(isGardenComplete(completed), true);
  advance(scheduler, 5_000);
  assert.equal(controller.getState().growthStage, 4);
});

test("restart and game switching reset the complete Tiny Garden runtime", () => {
  const { controller, scheduler } = createRuntime();
  preparePlantedGarden(controller, scheduler);
  controller.restart();
  assert.equal(controller.getState().phase, "seedSelection");
  assert.equal(controller.getState().soilState, "empty");
  assert.equal(controller.getState().wateringCount, 0);
  controller.setInteractive(false);
  assert.equal(controller.getState().phase, "idle");
  controller.setInteractive(true);
  assert.deepEqual(
    { seed: controller.getState().selectedSeedId, soil: controller.getState().soilState },
    { seed: "sunflower", soil: "empty" },
  );
});

test("movement remains within bounds and clearing input prevents stuck walking", () => {
  const { controller, scheduler } = createRuntime();
  controller.setInteractive(true);
  controller.confirmSeed();
  controller.move(-1);
  advance(scheduler, 10_000);
  assert.equal(controller.getState().characterPosition, GARDEN_BOUNDS.minX);
  controller.stopMoving();
  const stoppedAt = controller.getState().characterPosition;
  advance(scheduler, 1_000);
  assert.equal(controller.getState().characterPosition, stoppedAt);
  controller.move(1);
  advance(scheduler, 20_000);
  assert.equal(controller.getState().characterPosition, GARDEN_BOUNDS.maxX);
});

test("inactive input is ignored, pause clears movement, and destroy cancels frames", () => {
  const { controller, scheduler } = createRuntime();
  controller.move(1);
  controller.action();
  assert.equal(controller.getState().phase, "idle");
  controller.setInteractive(true);
  controller.confirmSeed();
  controller.move(1);
  controller.setPaused(true);
  assert.equal(controller.getState().moveIntent, 0);
  assert.equal(scheduler.frames.size, 0);
  controller.setPaused(false);
  assert.equal(scheduler.frames.size, 1);
  controller.destroy();
  assert.equal(scheduler.frames.size, 0);
  assert.ok(scheduler.cancelled.length > 0);
});

test("reduced motion preserves the full gameplay state machine", () => {
  const { controller, scheduler } = createRuntime(true);
  preparePlantedGarden(controller, scheduler);
  controller.action();
  advance(scheduler, 2_100);
  assert.equal(controller.getState().wateringCount, 1);
  assert.equal(controller.getState().phase, "planted");
});

test("keyboard mapping is contextual and releases held movement", () => {
  assert.deepEqual(gardenKeyDownCommand("ArrowRight", "seedSelection"), { type: "cycleSeed", direction: 1 });
  assert.deepEqual(gardenKeyDownCommand("d", "carryingSeed"), { type: "move", direction: 1 });
  assert.deepEqual(gardenKeyUpCommand("d", "carryingSeed"), { type: "stopMoving" });
  assert.deepEqual(gardenKeyDownCommand(" ", "planted"), { type: "action" });
  assert.deepEqual(gardenKeyDownCommand("R", "bloomed"), { type: "restart" });
  assert.equal(gardenKeyDownCommand("ArrowDown", "planted"), null);
});

test("ambient and bloom randomness are deterministic when injected", () => {
  const first = reduceTinyGardenState(createInitialTinyGardenState(), { type: "activate", random: 0.25 });
  const second = reduceTinyGardenState(createInitialTinyGardenState(), { type: "activate", random: 0.25 });
  assert.equal(first.ambientOffsetMs, second.ambientOffsetMs);
  assert.equal(first.ambientOffsetMs, 1_000);
});

test("pixel atlases use exact 32px grids", async () => {
  const assets = [
    ["gardener.png", 224, 96],
    ["plants.png", 160, 96],
    ["environment.png", 256, 64],
  ] as const;
  for (const [name, width, height] of assets) {
    const metadata = await sharp(fileURLToPath(new URL(`../public/assets/games/tiny-garden/${name}`, import.meta.url))).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assert.equal(metadata.hasAlpha, true);
  }
});
