import { ARTILLERY_CONFIG, TERRAIN_POINTS } from "../data/config";
import { createProjectile, simulateTrajectory } from "../engine/projectile";
import { getMuzzlePosition } from "../engine/rules";
import type { MatchState, Owner, ProjectileState, Vector } from "../engine/types";

export interface RenderFrame {
  state: MatchState;
  projectile: ProjectileState | null;
  reducedMotion: boolean;
  compact: boolean;
  effectStartedAt: number | null;
  now: number;
}

function pixelRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawSky(context: CanvasRenderingContext2D) {
  context.fillStyle = "#10251f";
  context.fillRect(0, 0, ARTILLERY_CONFIG.worldWidth, ARTILLERY_CONFIG.worldHeight);
  context.fillStyle = "#18362d";
  context.fillRect(0, 108, ARTILLERY_CONFIG.worldWidth, 148);

  pixelRect(context, 38, 34, 25, 5, "#dbe8dd33");
  pixelRect(context, 44, 30, 13, 4, "#dbe8dd33");
  pixelRect(context, 274, 50, 31, 5, "#dbe8dd2b");
  pixelRect(context, 282, 46, 15, 4, "#dbe8dd2b");
}

function drawTerrain(context: CanvasRenderingContext2D) {
  context.beginPath();
  context.moveTo(TERRAIN_POINTS[0].x, TERRAIN_POINTS[0].y);
  for (let index = 1; index < TERRAIN_POINTS.length; index += 1) {
    context.lineTo(TERRAIN_POINTS[index].x, TERRAIN_POINTS[index].y);
  }
  context.lineTo(ARTILLERY_CONFIG.worldWidth, ARTILLERY_CONFIG.worldHeight);
  context.lineTo(0, ARTILLERY_CONFIG.worldHeight);
  context.closePath();
  context.fillStyle = "#243d2e";
  context.fill();

  context.beginPath();
  context.moveTo(TERRAIN_POINTS[0].x, TERRAIN_POINTS[0].y);
  for (let index = 1; index < TERRAIN_POINTS.length; index += 1) {
    context.lineTo(TERRAIN_POINTS[index].x, TERRAIN_POINTS[index].y);
  }
  context.strokeStyle = "#6d8b5f";
  context.lineWidth = 3;
  context.stroke();

  pixelRect(context, 19, 205, 2, 6, "#91a96e");
  pixelRect(context, 23, 202, 2, 8, "#91a96e");
  pixelRect(context, 25, 205, 2, 5, "#91a96e");
  pixelRect(context, 122, 208, 2, 7, "#91a96e");
  pixelRect(context, 126, 210, 2, 5, "#91a96e");
  pixelRect(context, 296, 202, 2, 7, "#91a96e");
  pixelRect(context, 300, 199, 2, 9, "#91a96e");

  pixelRect(context, 183, 202, 13, 7, "#59635b");
  pixelRect(context, 186, 199, 8, 4, "#6e786e");
  pixelRect(context, 239, 204, 20, 3, "#80694e");
  pixelRect(context, 253, 201, 4, 3, "#80694e");
  pixelRect(context, 101, 197, 7, 4, "#76945c");
  pixelRect(context, 106, 194, 6, 3, "#76945c");
}

function drawAnt(
  context: CanvasRenderingContext2D,
  owner: Owner,
  position: Vector,
  state: MatchState,
) {
  const facing = owner === "player" ? 1 : -1;
  const health = owner === "player" ? state.player.health : state.enemy.health;
  const isHit = state.pendingImpact && state.lastDamage && state.lastDamage[owner] > 0;
  const defeated = health <= 0;
  const celebrating = state.phase === "playerWon" && owner === "player";
  const body = owner === "player" ? "#d5b65b" : "#ce745f";
  const highlight = owner === "player" ? "#f0d67c" : "#e99a82";
  const dark = "#171916";
  const x = Math.round(position.x - 16);
  const y = Math.round(position.y - 16 + (defeated ? 8 : isHit ? -2 : 0));

  context.save();
  if (defeated) {
    context.translate(position.x, position.y);
    context.rotate(facing * 0.9);
    context.translate(-position.x, -position.y);
  }

  pixelRect(context, x + 6, y + 14, 11, 9, body);
  pixelRect(context, x + 15, y + 12, 9, 8, body);
  pixelRect(context, x + 21, y + 8, 7, 8, highlight);
  pixelRect(context, x + 3, y + 16, 6, 6, highlight);
  pixelRect(context, x + 7, y + 21, 3, 7, dark);
  pixelRect(context, x + 14, y + 22, 3, 7, dark);
  pixelRect(context, x + 20, y + 20, 3, 8, dark);
  pixelRect(context, x + 25, y + 14, 2, 2, dark);
  pixelRect(context, x + 27, y + 7, 2, 5, dark);
  pixelRect(context, x + 23, y + 5, 2, 4, dark);

  const aim = owner === "player" ? state.aimAngle : state.enemyAim?.angle ?? 45;
  const radians = aim * Math.PI / 180;
  const launcherStartX = position.x + facing * 8;
  const launcherStartY = position.y - 8;
  const launcherEndX = launcherStartX + Math.cos(radians) * 15 * facing;
  const launcherEndY = launcherStartY - Math.sin(radians) * 15;
  context.strokeStyle = "#c8cbc0";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(Math.round(launcherStartX), Math.round(launcherStartY));
  context.lineTo(Math.round(launcherEndX), Math.round(launcherEndY));
  context.stroke();
  context.strokeStyle = dark;
  context.lineWidth = 2;
  context.stroke();

  if (celebrating) {
    pixelRect(context, x + 7, y + 7, 2, 8, highlight);
    pixelRect(context, x + 16, y + 5, 2, 9, highlight);
  }
  context.restore();
}

function drawTrajectory(context: CanvasRenderingContext2D, frame: RenderFrame) {
  if (frame.state.phase !== "playerAiming") return;
  const projectile = createProjectile(
    "player",
    getMuzzlePosition("player", frame.state),
    frame.state.aimAngle,
    frame.state.shotPower,
  );
  const points = simulateTrajectory({
    projectile,
    wind: frame.state.wind,
    state: frame.state,
    pointCount: frame.compact || frame.reducedMotion
      ? ARTILLERY_CONFIG.compactTrajectoryPoints
      : ARTILLERY_CONFIG.trajectoryPoints,
  });
  points.forEach((point, index) => {
    const alpha = Math.max(0.18, 0.72 - index * 0.035);
    pixelRect(context, point.x - 1, point.y - 1, 2, 2, `rgba(232, 242, 200, ${alpha})`);
  });
}

function drawProjectile(context: CanvasRenderingContext2D, projectile: ProjectileState | null) {
  if (!projectile || projectile.hasResolved) return;
  pixelRect(context, projectile.position.x - 2, projectile.position.y - 2, 5, 5, "#f1e7bd");
  pixelRect(context, projectile.position.x - 1, projectile.position.y - 1, 2, 2, "#ffffff");
}

function drawImpact(context: CanvasRenderingContext2D, frame: RenderFrame) {
  if (!frame.state.pendingImpact || frame.effectStartedAt === null) return;
  const elapsed = Math.max(0, frame.now - frame.effectStartedAt);
  const progress = Math.min(1, elapsed / (frame.reducedMotion ? 120 : 450));
  const radius = frame.reducedMotion ? 7 : 5 + progress * 13;
  const { x, y } = frame.state.pendingImpact.position;
  context.strokeStyle = `rgba(232, 242, 200, ${1 - progress})`;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(Math.round(x), Math.round(y), Math.round(radius), 0, Math.PI * 2);
  context.stroke();
  pixelRect(context, x - 3, y - 3, 6, 6, "#d9a35f");
  if (!frame.reducedMotion) {
    pixelRect(context, x - radius, y - 5, 3, 3, "#c6b898");
    pixelRect(context, x + radius - 2, y - 8, 3, 3, "#c6b898");
    pixelRect(context, x + 4, y - radius, 3, 3, "#c6b898");
  }
}

export function renderArtilleryFrame(canvas: HTMLCanvasElement, frame: RenderFrame) {
  const bounds = canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, Math.round(bounds.width || ARTILLERY_CONFIG.worldWidth));
  const cssHeight = Math.max(1, Math.round(bounds.height || ARTILLERY_CONFIG.worldHeight));
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const targetWidth = Math.round(cssWidth * ratio);
  const targetHeight = Math.round(cssHeight * ratio);
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, cssWidth, cssHeight);

  const scale = Math.min(cssWidth / ARTILLERY_CONFIG.worldWidth, cssHeight / ARTILLERY_CONFIG.worldHeight);
  const offsetX = Math.round((cssWidth - ARTILLERY_CONFIG.worldWidth * scale) / 2);
  const offsetY = Math.round((cssHeight - ARTILLERY_CONFIG.worldHeight * scale) / 2);
  context.save();
  context.translate(offsetX, offsetY);
  context.scale(scale, scale);
  drawSky(context);
  drawTerrain(context);
  drawTrajectory(context, frame);
  drawAnt(context, "player", frame.state.player.position, frame.state);
  drawAnt(context, "enemy", frame.state.enemy.position, frame.state);
  drawProjectile(context, frame.projectile);
  drawImpact(context, frame);
  context.restore();
}
