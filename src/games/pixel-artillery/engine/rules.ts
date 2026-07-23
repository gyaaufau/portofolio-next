import { ARTILLERY_CONFIG, TERRAIN_POINTS } from "../data/config";
import type { DamageResult, MatchState, Owner, ProjectileImpact, RandomSource, Vector } from "./types";

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function clampAngle(angle: number) {
  return clamp(angle, ARTILLERY_CONFIG.minimumAngle, ARTILLERY_CONFIG.maximumAngle);
}

export function clampPower(power: number) {
  return clamp(power, ARTILLERY_CONFIG.minimumPower, ARTILLERY_CONFIG.maximumPower);
}

export function clampHealth(health: number) {
  return clamp(Math.round(health), 0, ARTILLERY_CONFIG.maximumHealth);
}

export function getTerrainHeight(x: number) {
  const boundedX = clamp(x, 0, ARTILLERY_CONFIG.worldWidth);
  for (let index = 1; index < TERRAIN_POINTS.length; index += 1) {
    const left = TERRAIN_POINTS[index - 1];
    const right = TERRAIN_POINTS[index];
    if (boundedX <= right.x) {
      const progress = (boundedX - left.x) / (right.x - left.x);
      return left.y + (right.y - left.y) * progress;
    }
  }
  return TERRAIN_POINTS[TERRAIN_POINTS.length - 1].y;
}

export function getAntPosition(owner: Owner): Vector {
  const x = owner === "player" ? ARTILLERY_CONFIG.playerX : ARTILLERY_CONFIG.enemyX;
  return { x, y: getTerrainHeight(x) - 16 };
}

export function getMuzzlePosition(owner: Owner, state: MatchState): Vector {
  const ant = owner === "player" ? state.player : state.enemy;
  return {
    x: ant.position.x + (owner === "player" ? 14 : -14),
    y: ant.position.y - 5,
  };
}

export function distanceBetween(first: Vector, second: Vector) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function calculateExplosionDamage(distance: number) {
  if (distance <= ARTILLERY_CONFIG.directHitRadius) return ARTILLERY_CONFIG.directHitDamage;
  if (distance > ARTILLERY_CONFIG.splashRadius) return 0;
  const progress = (distance - ARTILLERY_CONFIG.directHitRadius)
    / (ARTILLERY_CONFIG.splashRadius - ARTILLERY_CONFIG.directHitRadius);
  return Math.round(
    ARTILLERY_CONFIG.maximumSplashDamage
      - progress * (ARTILLERY_CONFIG.maximumSplashDamage - ARTILLERY_CONFIG.minimumSplashDamage),
  );
}

export function calculateImpactDamage(impact: ProjectileImpact, state: MatchState): DamageResult {
  const result: DamageResult = { player: 0, enemy: 0 };
  for (const owner of ["player", "enemy"] as const) {
    const ant = owner === "player" ? state.player : state.enemy;
    result[owner] = impact.target === owner
      ? ARTILLERY_CONFIG.directHitDamage
      : calculateExplosionDamage(distanceBetween(impact.position, ant.position));
  }
  return result;
}

export function canPlayerAim(state: MatchState) {
  return state.phase === "playerAiming" && state.turn === "player";
}

export function canPlayerFire(state: MatchState) {
  return canPlayerAim(state);
}

export function isMatchComplete(state: MatchState) {
  return state.player.health <= 0 || state.enemy.health <= 0;
}

export function createSeededRandom(seed: number): RandomSource {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function chooseWind(random: RandomSource) {
  const raw = (random() * 2 - 1) * ARTILLERY_CONFIG.maximumWind;
  const rounded = Math.round(raw * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
}
