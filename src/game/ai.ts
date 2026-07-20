import { CHARACTERS } from "./characters";
import { EMPTY_INPUT, type AIContext, type AIDecision, type InputState } from "./types";

const input = (overrides: Partial<InputState>): InputState => ({ ...EMPTY_INPUT, ...overrides });

export function decideAI(context: AIContext): AIDecision {
  const { self, opponent, arenaWidth, floorY, random, activeItem } = context;
  const profile = CHARACTERS[self.character].ai;
  const horizontal = opponent.x - self.x;
  const distance = Math.abs(horizontal);
  const toward = horizontal < 0 ? { left: true } : { right: true };
  const away = horizontal < 0 ? { right: true } : { left: true };
  const nearEdge = self.x < 34 || self.x > arenaWidth - 34;
  const belowStage = self.y > floorY + 8;

  if (belowStage || self.y > floorY + 28) {
    return { state: "recover", input: input({ ...toward, jump: true }), holdMs: 240 };
  }
  if (nearEdge && distance > 56) {
    return { state: "reposition", input: input({ ...(self.x < arenaWidth / 2 ? { right: true } : { left: true }), jump: random < 0.24 }), holdMs: 260 };
  }
  if (self.hitStunUntil > context.now) {
    return { state: "observe", input: input({}), holdMs: 190 };
  }
  if (activeItem) {
    const itemHorizontal = activeItem.x - self.x;
    const itemDistance = Math.abs(itemHorizontal);
    const itemToward = itemHorizontal < 0 ? { left: true } : { right: true };
    const pickupIsUseful = activeItem.kind === "pickup"
      && (activeItem.item !== "heal" || self.vitality < 86)
      && distance > 28;
    if (pickupIsUseful && itemDistance < 94) {
      return { state: "collect", input: input({ ...itemToward, jump: activeItem.y + 16 < self.y }), holdMs: 250 };
    }
    if (activeItem.kind === "container" && itemDistance < 48 && distance > 30) {
      return { state: "break-container", input: input({ ...itemToward, light: itemDistance < 25 }), holdMs: 240 };
    }
  }
  if (opponent.hitStunUntil > context.now && distance < 62) {
    return { state: "pursue", input: input({ ...toward, special: distance < profile.preferredRange }), holdMs: 230 };
  }
  if (distance < 34 && opponent.comboStage >= 1 && random < Math.min(0.92, profile.dodgeChance + 0.48)) {
    return { state: "dodge", input: input({ ...away, dodge: true }), holdMs: 210 };
  }
  if (distance < 22 && random < profile.dodgeChance) {
    return { state: "dodge", input: input({ ...away, dodge: true }), holdMs: 210 };
  }
  if (distance <= profile.preferredRange * 0.68 && context.now >= self.cooldownUntil) {
    const useSpecial = random <= 0.28;
    return { state: "attack", input: input({ ...(useSpecial ? toward : {}), light: !useSpecial, special: useSpecial }), holdMs: 220 };
  }
  if (distance > profile.preferredRange * 1.18) {
    return { state: "approach", input: input({ ...toward, jump: opponent.y + 18 < self.y && random < profile.jumpChance }), holdMs: 260 };
  }
  if (distance < profile.preferredRange * 0.48 && random > profile.aggression) {
    return { state: "retreat", input: input({ ...away, jump: random < profile.jumpChance / 2 }), holdMs: 220 };
  }
  if (opponent.y > floorY + 4 && distance < 70 && random < 0.35) {
    return { state: "edge-guard", input: input({ ...toward, light: true }), holdMs: 220 };
  }
  if (random < profile.jumpChance) {
    return { state: "jump", input: input({ ...toward, jump: true }), holdMs: 220 };
  }
  return { state: "observe", input: input({ ...(random < profile.aggression ? toward : {}) }), holdMs: 190 };
}
