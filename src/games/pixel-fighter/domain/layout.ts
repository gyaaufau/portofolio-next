/** Responsive arena geometry independent of the renderer. */
import type { ArenaLayout } from "./types";

export function createArenaLayout(width: number, height: number): ArenaLayout {
  const safeWidth = Math.max(300, Math.round(width));
  const safeHeight = Math.max(200, Math.round(height));
  const floorY = safeHeight - 29;
  const center = safeWidth / 2;
  const spawnGap = Math.min(74, Math.max(50, safeWidth * 0.18));
  return {
    width: safeWidth,
    height: safeHeight,
    floorY,
    arenaLeft: 11,
    arenaRight: safeWidth - 11,
    playerSpawnX: center - spawnGap,
    enemySpawnX: center + spawnGap,
    upperPlatforms: [
      { x: safeWidth * 0.26, y: floorY - 60, width: Math.min(108, safeWidth * 0.31) },
      { x: safeWidth * 0.74, y: floorY - 77, width: Math.min(96, safeWidth * 0.28) },
    ],
    blastPaddingX: Math.max(35, safeWidth * 0.12),
    blastPaddingTop: 45,
    blastPaddingBottom: 38,
  };
}
