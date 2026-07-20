import type { MatchResult, RoundState } from "./types";

export const MAX_VITALITY = 100;
export const ROUND_SECONDS = 45;
export const WINS_TO_MATCH = 2;

export function clampVitality(value: number) {
  return Math.max(0, Math.min(MAX_VITALITY, Math.round(value)));
}

export function applyDamage(vitality: number, damage: number) {
  return clampVitality(vitality - Math.max(0, damage));
}

export function calculateKnockback(base: number, remainingVitality: number, weight = 1) {
  const damageFactor = 1 + (MAX_VITALITY - clampVitality(remainingVitality)) / 120;
  return Math.round((base * damageFactor) / Math.max(0.5, weight));
}

export function resolveTimedRound(playerVitality: number, enemyVitality: number) {
  if (playerVitality === enemyVitality) return "sudden-death" as const;
  return playerVitality > enemyVitality ? "player" as const : "enemy" as const;
}

export function awardRound(state: RoundState, winner: "player" | "enemy"): RoundState {
  return {
    ...state,
    playerWins: state.playerWins + (winner === "player" ? 1 : 0),
    enemyWins: state.enemyWins + (winner === "enemy" ? 1 : 0),
  };
}

export function getMatchResult(
  state: Pick<RoundState, "playerWins" | "enemyWins"> & Partial<Pick<RoundState, "playerScore" | "enemyScore">>,
): MatchResult | null {
  if (state.playerWins < WINS_TO_MATCH && state.enemyWins < WINS_TO_MATCH) return null;
  return {
    winner: state.playerWins > state.enemyWins ? "player" : "enemy",
    playerWins: state.playerWins,
    enemyWins: state.enemyWins,
    playerScore: state.playerScore ?? 0,
    enemyScore: state.enemyScore ?? 0,
  };
}

export function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
