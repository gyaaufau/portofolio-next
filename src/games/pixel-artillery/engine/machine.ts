import { ARTILLERY_CONFIG } from "../data/config";
import { canPlayerAim, clampAngle, clampHealth, clampPower, getAntPosition } from "./rules";
import type { MatchEvent, MatchState } from "./types";

export function createInitialMatch(wind = 0, phase: MatchState["phase"] = "ready"): MatchState {
  return {
    phase,
    turn: phase === "ready" ? "none" : "player",
    player: { health: ARTILLERY_CONFIG.maximumHealth, position: getAntPosition("player") },
    enemy: { health: ARTILLERY_CONFIG.maximumHealth, position: getAntPosition("enemy") },
    aimAngle: ARTILLERY_CONFIG.defaultAngle,
    shotPower: ARTILLERY_CONFIG.defaultPower,
    enemyAim: null,
    wind,
    pendingImpact: null,
    lastDamage: null,
    turnNumber: 1,
    isFocused: false,
    announcement: phase === "ready"
      ? "Tiny Artillery ready."
      : "Player turn. Adjust angle and power, then fire.",
  };
}

function formatDamage(damage: number, target: "player" | "enemy") {
  if (damage <= 0) return "The shot missed.";
  return `${target === "enemy" ? "Enemy" : "Player"} hit for ${damage} damage.`;
}

export function artilleryReducer(state: MatchState, event: MatchEvent): MatchState {
  switch (event.type) {
    case "START":
      if (state.phase !== "ready") return state;
      return { ...state, phase: "playerAiming", turn: "player", announcement: "Player turn. Adjust angle and power, then fire." };
    case "RETURN_TO_READY":
      return createInitialMatch(event.wind, "ready");
    case "ADJUST_ANGLE":
      if (!canPlayerAim(state)) return state;
      return {
        ...state,
        aimAngle: clampAngle(state.aimAngle + event.delta),
        announcement: `Angle ${clampAngle(state.aimAngle + event.delta)} degrees.`,
      };
    case "ADJUST_POWER":
      if (!canPlayerAim(state)) return state;
      return {
        ...state,
        shotPower: clampPower(state.shotPower + event.delta),
        announcement: `Power ${clampPower(state.shotPower + event.delta)} percent.`,
      };
    case "AI_AIM":
      if (state.phase !== "enemyThinking") return state;
      return { ...state, enemyAim: event.aim, announcement: "Enemy is taking aim." };
    case "FIRE": {
      const allowed = event.owner === "player"
        ? state.phase === "playerAiming" && state.turn === "player"
        : state.phase === "enemyThinking" && state.turn === "enemy" && Boolean(state.enemyAim);
      if (!allowed) return state;
      return {
        ...state,
        phase: event.owner === "player" ? "playerProjectile" : "enemyProjectile",
        turn: event.owner,
        pendingImpact: null,
        lastDamage: null,
        announcement: event.owner === "player" ? "Shot fired." : "Enemy fired.",
      };
    }
    case "IMPACT": {
      const expectedPhase = event.owner === "player" ? "playerProjectile" : "enemyProjectile";
      if (state.phase !== expectedPhase || state.pendingImpact) return state;
      const playerHealth = clampHealth(state.player.health - event.damage.player);
      const enemyHealth = clampHealth(state.enemy.health - event.damage.enemy);
      const primaryTarget = event.damage.enemy >= event.damage.player ? "enemy" : "player";
      return {
        ...state,
        phase: event.owner === "player" ? "resolvingPlayerHit" : "resolvingEnemyHit",
        turn: "none",
        player: { ...state.player, health: playerHealth },
        enemy: { ...state.enemy, health: enemyHealth },
        pendingImpact: event.impact,
        lastDamage: event.damage,
        announcement: formatDamage(event.damage[primaryTarget], primaryTarget),
      };
    }
    case "RESOLVE_IMPACT": {
      const expectedPhase = event.owner === "player" ? "resolvingPlayerHit" : "resolvingEnemyHit";
      if (state.phase !== expectedPhase) return state;
      if (state.enemy.health <= 0) {
        return { ...state, phase: "playerWon", turn: "none", announcement: "Victory. The colony is safe." };
      }
      if (state.player.health <= 0) {
        return { ...state, phase: "playerLost", turn: "none", announcement: "Defeat. The ant will recover." };
      }
      if (event.owner === "player") {
        return {
          ...state,
          phase: "enemyThinking",
          turn: "enemy",
          enemyAim: null,
          pendingImpact: null,
          lastDamage: null,
          wind: event.nextWind,
          turnNumber: state.turnNumber + 1,
          announcement: "Enemy turn.",
        };
      }
      return {
        ...state,
        phase: "playerAiming",
        turn: "player",
        enemyAim: null,
        pendingImpact: null,
        lastDamage: null,
        wind: event.nextWind,
        turnNumber: state.turnNumber + 1,
        announcement: "Player turn. Adjust angle and power, then fire.",
      };
    }
    case "RESTART":
      return createInitialMatch(event.wind, "playerAiming");
    case "FOCUS":
      return state.isFocused ? state : { ...state, isFocused: true };
    case "BLUR":
      return state.isFocused ? { ...state, isFocused: false } : state;
    default:
      return state;
  }
}
