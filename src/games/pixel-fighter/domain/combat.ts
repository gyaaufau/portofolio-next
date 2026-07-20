/** Pure combo and animation-state rules. */
import type { AnimationId, AttackDefinition } from "./types";

export function nextComboStage(current: number, grounded: boolean, aerialStages: number) {
  const next = current + 1;
  return next < (grounded ? 3 : aerialStages) ? next : null;
}

export function readyHitIndexes(attack: AttackDefinition, elapsedMs: number, consumed: ReadonlySet<number>) {
  return attack.hits
    .map((window, index) => ({ window, index }))
    .filter(({ window, index }) => elapsedMs >= window.atMs && !consumed.has(index));
}

export function canDodgeCancel(attack: AttackDefinition | undefined, elapsedMs: number) {
  return !attack || elapsedMs >= attack.recoveryStartMs;
}

export function shouldEnterVisualState(current: AnimationId | undefined, requested: AnimationId) {
  return current !== requested;
}
