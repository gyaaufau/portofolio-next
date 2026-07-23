import { SEED_IDS } from "./seeds";
import type { GrowthStage, SeedId, TinyGardenState, WateringCount } from "./types";

export const GARDEN_BOUNDS = { minX: 54, maxX: 248 } as const;
export const SOIL_X = 232;
export const SOIL_INTERACTION_RADIUS = 42;
export const MOVE_SPEED = 46;
export const PLANTING_DURATION_MS = 1_100;
export const WATERING_DURATION_MS = 900;
export const GROWTH_DURATION_MS = 1_000;
export const ACTION_COOLDOWN_MS = 360;

export const RESULT_MESSAGES = [
  "It grew beautifully.",
  "A tiny garden, complete.",
  "You touched grass.",
] as const;

export function clampRandom(value: number) {
  return Math.min(0.999_999, Math.max(0, value));
}

export function clampCharacterPosition(value: number) {
  return Math.round(Math.min(GARDEN_BOUNDS.maxX, Math.max(GARDEN_BOUNDS.minX, value)));
}

export function isNearSoil(characterPosition: number) {
  return Math.abs(characterPosition - SOIL_X) <= SOIL_INTERACTION_RADIUS;
}

export function canMove(state: TinyGardenState) {
  return state.phase === "carryingSeed" || state.phase === "planted";
}

export function canPlant(state: TinyGardenState) {
  return state.phase === "carryingSeed" && state.soilState === "empty" && isNearSoil(state.characterPosition);
}

export function canWater(state: TinyGardenState) {
  return state.phase === "planted"
    && state.soilState === "planted"
    && state.wateringCount < 3
    && state.actionCooldownMs <= 0
    && isNearSoil(state.characterPosition);
}

export function cycleSeed(seedId: SeedId, direction: -1 | 1): SeedId {
  const current = SEED_IDS.indexOf(seedId);
  return SEED_IDS[(current + direction + SEED_IDS.length) % SEED_IDS.length];
}

export function nextWateringCount(current: WateringCount): WateringCount {
  return Math.min(3, current + 1) as WateringCount;
}

export function growthStageForWatering(count: WateringCount): GrowthStage {
  return Math.min(3, count) as GrowthStage;
}

export function isGardenComplete(state: TinyGardenState) {
  return state.phase === "bloomed" && state.growthStage === 4 && state.wateringCount === 3;
}

export function chooseResultMessage(random: number) {
  return RESULT_MESSAGES[Math.floor(clampRandom(random) * RESULT_MESSAGES.length)];
}
