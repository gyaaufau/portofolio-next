import type { TinyGardenPhase } from "../domain/types";

export type GardenKeyCommand =
  | { type: "cycleSeed"; direction: -1 | 1 }
  | { type: "move"; direction: -1 | 1 }
  | { type: "stopMoving" }
  | { type: "confirmSeed" }
  | { type: "action" }
  | { type: "restart" }
  | { type: "exit" };

const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);
const ACTION_KEYS = new Set([" ", "Spacebar", "Enter"]);

export function gardenKeyDownCommand(key: string, phase: TinyGardenPhase, repeat = false): GardenKeyCommand | null {
  if (key === "Escape") return { type: "exit" };
  if ((key === "r" || key === "R") && phase === "bloomed") return { type: "restart" };

  if (LEFT_KEYS.has(key)) {
    if (phase === "seedSelection") return repeat ? null : { type: "cycleSeed", direction: -1 };
    if (phase === "carryingSeed" || phase === "planted") return { type: "move", direction: -1 };
  }
  if (RIGHT_KEYS.has(key)) {
    if (phase === "seedSelection") return repeat ? null : { type: "cycleSeed", direction: 1 };
    if (phase === "carryingSeed" || phase === "planted") return { type: "move", direction: 1 };
  }
  if (ACTION_KEYS.has(key) && !repeat) {
    if (phase === "seedSelection") return { type: "confirmSeed" };
    if (phase === "bloomed") return { type: "restart" };
    if (phase === "carryingSeed" || phase === "planted") return { type: "action" };
  }
  return null;
}

export function gardenKeyUpCommand(key: string, phase: TinyGardenPhase): GardenKeyCommand | null {
  if ((LEFT_KEYS.has(key) || RIGHT_KEYS.has(key)) && (phase === "carryingSeed" || phase === "planted")) {
    return { type: "stopMoving" };
  }
  return null;
}
