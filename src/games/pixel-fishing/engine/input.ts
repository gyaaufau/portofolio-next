import type { ActionHint } from "../domain/state";

export type FishingKeyCommand =
  | { type: "move"; direction: -1 | 1 }
  | { type: "stopMoving" }
  | { type: "action" }
  | { type: "pressAction" }
  | { type: "releaseAction" }
  | { type: "exit" };

const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);
const ACTION_KEYS = new Set([" ", "Spacebar", "Enter"]);

export function fishingKeyDownCommand(key: string, hint: ActionHint, repeat = false): FishingKeyCommand | null {
  if (key === "Escape") return { type: "exit" };
  if (LEFT_KEYS.has(key)) return { type: "move", direction: -1 };
  if (RIGHT_KEYS.has(key)) return { type: "move", direction: 1 };
  if (ACTION_KEYS.has(key) && !repeat) {
    if (hint === "hook" || hint === "reel") return { type: "pressAction" };
    if (hint === "board" || hint === "disembark" || hint === "cast") return { type: "action" };
  }
  return null;
}

export function fishingKeyUpCommand(key: string): FishingKeyCommand | null {
  if (LEFT_KEYS.has(key) || RIGHT_KEYS.has(key)) return { type: "stopMoving" };
  if (ACTION_KEYS.has(key)) return { type: "releaseAction" };
  return null;
}
