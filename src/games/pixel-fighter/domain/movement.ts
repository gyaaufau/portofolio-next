/** Pure movement and recovery rules. */
export const COYOTE_TIME_MS = 105;
export const JUMP_BUFFER_MS = 115;
export const MAX_JUMPS = 2;

export function canUseBufferedJump({
  now,
  bufferedUntil,
  grounded,
  coyoteUntil,
  jumpsUsed,
}: {
  now: number;
  bufferedUntil: number;
  grounded: boolean;
  coyoteUntil: number;
  jumpsUsed: number;
}) {
  if (now > bufferedUntil) return false;
  return grounded || now <= coyoteUntil || jumpsUsed < MAX_JUMPS;
}

export function fastFallVelocity(currentVelocity: number, minimumVelocity = 108) {
  return Math.max(currentVelocity, minimumVelocity);
}

export function isOutsideBlastBoundary(x: number, y: number, width: number, height: number, margin = 24) {
  return y > height + margin || x < -margin || x > width + margin;
}

export function needsEdgeRecovery(x: number, y: number, arenaWidth: number, floorY: number) {
  return y > floorY + 8 || x < 18 || x > arenaWidth - 18;
}
