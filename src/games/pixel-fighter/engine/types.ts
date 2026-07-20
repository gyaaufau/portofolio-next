import type { InputState } from "../domain/types";

/** Imperative boundary private to the pixel-fighter adapter. */
export interface FightGameController {
  start: () => void;
  replay: () => void;
  pause: (paused: boolean) => void;
  setMobileInput: (next: Partial<InputState>) => void;
  setMuted: (muted: boolean) => void;
  destroy: () => void;
}

