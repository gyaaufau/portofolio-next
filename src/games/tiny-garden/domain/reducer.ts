import {
  ACTION_COOLDOWN_MS,
  GROWTH_DURATION_MS,
  MOVE_SPEED,
  PLANTING_DURATION_MS,
  WATERING_DURATION_MS,
  canMove,
  canPlant,
  canWater,
  chooseResultMessage,
  clampCharacterPosition,
  clampRandom,
  cycleSeed,
  growthStageForWatering,
  isNearSoil,
  nextWateringCount,
} from "./rules";
import { getSeedDefinition } from "./seeds";
import type { TinyGardenEvent, TinyGardenSnapshot, TinyGardenState } from "./types";

export function createInitialTinyGardenState(): TinyGardenState {
  return {
    phase: "idle",
    selectedSeedId: "sunflower",
    characterPosition: 82,
    characterDirection: "right",
    characterAnimation: "idle",
    moveIntent: 0,
    soilState: "empty",
    growthStage: 0,
    wateringCount: 0,
    actionElapsedMs: 0,
    actionCooldownMs: 0,
    ambientOffsetMs: 0,
    sparkleRemainingMs: 0,
    resultMessage: null,
  };
}

function activateState(random: number): TinyGardenState {
  return {
    ...createInitialTinyGardenState(),
    phase: "seedSelection",
    ambientOffsetMs: Math.round(clampRandom(random) * 4_000),
  };
}

function tickState(state: TinyGardenState, deltaMs: number, random: number): TinyGardenState {
  const delta = Math.max(0, Math.min(100, deltaMs));
  const actionCooldownMs = Math.max(0, state.actionCooldownMs - delta);
  const sparkleRemainingMs = Math.max(0, state.sparkleRemainingMs - delta);
  let next = { ...state, actionCooldownMs, sparkleRemainingMs };

  if (canMove(state) && state.moveIntent !== 0) {
    next = {
      ...next,
      characterPosition: clampCharacterPosition(state.characterPosition + state.moveIntent * MOVE_SPEED * delta / 1_000),
      characterDirection: state.moveIntent < 0 ? "left" : "right",
      characterAnimation: "walking",
    };
  } else if (canMove(state) && state.characterAnimation === "walking") {
    next.characterAnimation = "idle";
  }

  if (state.phase === "planting") {
    const elapsed = state.actionElapsedMs + delta;
    if (elapsed >= PLANTING_DURATION_MS) {
      return {
        ...next,
        phase: "planted",
        characterAnimation: "idle",
        soilState: "planted",
        actionElapsedMs: 0,
        actionCooldownMs: 0,
      };
    }
    return { ...next, actionElapsedMs: elapsed };
  }

  if (state.phase === "watering") {
    const elapsed = state.actionElapsedMs + delta;
    if (elapsed >= WATERING_DURATION_MS) {
      const wateringCount = nextWateringCount(state.wateringCount);
      return {
        ...next,
        phase: "growing",
        characterAnimation: "kneeling",
        wateringCount,
        growthStage: growthStageForWatering(wateringCount),
        actionElapsedMs: 0,
        sparkleRemainingMs: 760,
      };
    }
    return { ...next, actionElapsedMs: elapsed };
  }

  if (state.phase === "growing") {
    const elapsed = state.actionElapsedMs + delta;
    if (elapsed >= GROWTH_DURATION_MS) {
      if (state.wateringCount >= 3) {
        return {
          ...next,
          phase: "bloomed",
          characterAnimation: "celebrating",
          growthStage: 4,
          actionElapsedMs: 0,
          resultMessage: chooseResultMessage(random),
        };
      }
      return {
        ...next,
        phase: "planted",
        characterAnimation: "idle",
        actionElapsedMs: 0,
        actionCooldownMs: 0,
      };
    }
    return { ...next, actionElapsedMs: elapsed };
  }

  return next;
}

export function reduceTinyGardenState(state: TinyGardenState, event: TinyGardenEvent): TinyGardenState {
  if (event.type === "activate") return state.phase === "idle" ? activateState(event.random) : state;
  if (event.type === "deactivate") return createInitialTinyGardenState();
  if (event.type === "restart") return activateState(event.random);
  if (event.type === "tick") return tickState(state, event.deltaMs, event.random);

  if (event.type === "selectSeed" && state.phase === "seedSelection") {
    return { ...state, selectedSeedId: event.seedId };
  }
  if (event.type === "cycleSeed" && state.phase === "seedSelection") {
    return { ...state, selectedSeedId: cycleSeed(state.selectedSeedId, event.direction) };
  }
  if (event.type === "confirmSeed" && state.phase === "seedSelection") {
    return { ...state, phase: "carryingSeed", characterAnimation: "idle" };
  }
  if (event.type === "move" && canMove(state)) {
    return {
      ...state,
      moveIntent: event.direction,
      characterDirection: event.direction < 0 ? "left" : "right",
      characterAnimation: "walking",
    };
  }
  if (event.type === "stopMoving") {
    return { ...state, moveIntent: 0, characterAnimation: canMove(state) ? "idle" : state.characterAnimation };
  }
  if (event.type === "action" && canPlant(state)) {
    return { ...state, phase: "planting", moveIntent: 0, characterAnimation: "planting", actionElapsedMs: 0, actionCooldownMs: ACTION_COOLDOWN_MS };
  }
  if (event.type === "action" && canWater(state)) {
    return { ...state, phase: "watering", moveIntent: 0, characterAnimation: "watering", actionElapsedMs: 0, actionCooldownMs: ACTION_COOLDOWN_MS };
  }
  return state;
}

export function tinyGardenStatus(state: TinyGardenState) {
  const seed = getSeedDefinition(state.selectedSeedId).name;
  switch (state.phase) {
    case "idle": return "Choose a seed to begin.";
    case "seedSelection": return `${seed} seed selected.`;
    case "carryingSeed": return isNearSoil(state.characterPosition) ? "Press Space to plant." : "Walk toward the soil patch.";
    case "planting": return "Planting the seed.";
    case "planted": return isNearSoil(state.characterPosition) ? `Press Space to water. ${state.wateringCount} of 3 waterings complete.` : "Walk back to the planted soil.";
    case "watering": return "Watering the plant.";
    case "growing": return "The plant is growing.";
    case "bloomed": return state.resultMessage ?? "A tiny garden, complete.";
  }
}

export function tinyGardenActionLabel(state: TinyGardenState) {
  if (state.phase === "seedSelection") return "Select";
  if (state.phase === "carryingSeed") return "Plant";
  if (state.phase === "planted") return "Water";
  if (state.phase === "bloomed") return "Plant again";
  return "Wait";
}

export function createTinyGardenSnapshot(state: TinyGardenState): TinyGardenSnapshot {
  return {
    phase: state.phase,
    selectedSeedId: state.selectedSeedId,
    growthStage: state.growthStage,
    wateringCount: state.wateringCount,
    isNearSoil: isNearSoil(state.characterPosition),
    status: tinyGardenStatus(state),
    actionLabel: tinyGardenActionLabel(state),
  };
}
