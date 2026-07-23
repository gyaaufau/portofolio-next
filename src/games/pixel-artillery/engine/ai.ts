import { ARTILLERY_CONFIG } from "../data/config";
import { clampAngle, clampPower } from "./rules";
import { powerToLaunchSpeed } from "./projectile";
import type { EnemyAim, MatchState, RandomSource } from "./types";

function speedToPower(speed: number) {
  const progress = (speed - ARTILLERY_CONFIG.minimumLaunchSpeed)
    / (ARTILLERY_CONFIG.maximumLaunchSpeed - ARTILLERY_CONFIG.minimumLaunchSpeed);
  return ARTILLERY_CONFIG.minimumPower
    + progress * (ARTILLERY_CONFIG.maximumPower - ARTILLERY_CONFIG.minimumPower);
}

function signedError(random: RandomSource, minimum: number, maximum: number) {
  const magnitude = minimum + random() * (maximum - minimum);
  return magnitude * (random() < 0.5 ? -1 : 1);
}

export function chooseEnemyShot(state: MatchState, random: RandomSource): EnemyAim {
  const horizontalDistance = Math.abs(state.enemy.position.x - state.player.position.x);
  const baseAngle = 42 + random() * 16;
  const radians = baseAngle * Math.PI / 180;
  const sineDoubleAngle = Math.max(0.2, Math.sin(2 * radians));
  const uncorrectedSpeed = Math.sqrt(horizontalDistance * ARTILLERY_CONFIG.gravity / sineDoubleAngle);
  const estimatedFlightTime = 2 * uncorrectedSpeed * Math.sin(radians) / ARTILLERY_CONFIG.gravity;
  const windDisplacement = 0.5
    * state.wind
    * ARTILLERY_CONFIG.windAcceleration
    * estimatedFlightTime
    * estimatedFlightTime;
  const correctedDistance = horizontalDistance + windDisplacement;
  const correctedSpeed = Math.sqrt(Math.max(1, correctedDistance) * ARTILLERY_CONFIG.gravity / sineDoubleAngle);
  let angle = baseAngle;
  let power = speedToPower(correctedSpeed);
  const qualityRoll = random();
  let quality: EnemyAim["quality"];

  if (qualityRoll < 0.2) {
    quality = "poor";
    angle += signedError(random, 8, 12);
    power += signedError(random, 10, 18);
  } else if (qualityRoll < 0.7) {
    quality = "near";
    angle += signedError(random, 3, 6);
    power += signedError(random, 4, 8);
  } else {
    quality = "strong";
    angle += signedError(random, 0, 2);
    power += signedError(random, 0, 3);
  }

  return {
    angle: Math.round(clampAngle(angle)),
    power: Math.round(clampPower(power)),
    quality,
  };
}

export function getEnemyThinkingDelay(random: RandomSource) {
  const range = ARTILLERY_CONFIG.enemyThinkingMaximumMs - ARTILLERY_CONFIG.enemyThinkingMinimumMs;
  return Math.round(ARTILLERY_CONFIG.enemyThinkingMinimumMs + random() * range);
}

export function isEnemyPowerReachable(power: number) {
  const speed = powerToLaunchSpeed(power);
  return speed >= ARTILLERY_CONFIG.minimumLaunchSpeed && speed <= ARTILLERY_CONFIG.maximumLaunchSpeed;
}
