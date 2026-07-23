import type { MatchPhase } from "./types";

export type InputCommand = "angleUp" | "angleDown" | "powerDown" | "powerUp" | "fire" | "restart" | "exit";

const AIMING_KEYS: Record<string, InputCommand> = {
  ArrowUp: "angleUp",
  w: "angleUp",
  W: "angleUp",
  ArrowDown: "angleDown",
  s: "angleDown",
  S: "angleDown",
  ArrowLeft: "powerDown",
  a: "powerDown",
  A: "powerDown",
  ArrowRight: "powerUp",
  d: "powerUp",
  D: "powerUp",
  " ": "fire",
  Enter: "fire",
};

export function getInputCommand(key: string, phase: MatchPhase, focused: boolean): InputCommand | null {
  if (!focused) return null;
  if (key === "Escape") return "exit";
  if ((key === "r" || key === "R") && (phase === "playerWon" || phase === "playerLost")) return "restart";
  if (phase !== "playerAiming") return null;
  return AIMING_KEYS[key] ?? null;
}

export class ArtilleryInputState {
  private held = new Set<string>();
  private focused = false;

  focus() {
    this.focused = true;
  }

  blur() {
    this.focused = false;
    this.held.clear();
  }

  keyDown(key: string, phase: MatchPhase) {
    const command = getInputCommand(key, phase, this.focused);
    if (command) this.held.add(key);
    return command;
  }

  keyUp(key: string) {
    this.held.delete(key);
  }

  clear() {
    this.held.clear();
  }

  isFocused() {
    return this.focused;
  }

  heldCount() {
    return this.held.size;
  }
}
