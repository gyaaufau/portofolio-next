import { FISHING_TIMING, type FishingState } from "../domain/state";
import { FISHING_SPRITES, type FishingAssets, type FishingSpriteId, type FishingStaticId, type SpriteSpec } from "./assets";

export const LAKE_WIDTH = 480;
export const LAKE_HEIGHT = 270;

const HORIZON_Y = 150;
const PIER_SURFACE_Y = 168;
const PIER_START_X = 136;
const PIER_END_X = 212;
const SHORE_TOP_Y = 166;
const BOAT_FLOAT_Y = 192;
const BOAT_SEAT_FEET_Y = 197;

const CATCH_IMAGES: Record<string, FishingStaticId> = {
  "pond-minnow": "fish1",
  "sunny-perch": "fish2",
  "copper-salmon": "fish3",
  "silver-dace": "fish4",
  "red-crab": "fish5",
  "lake-shark": "fish6",
  "reed-pike": "fish7",
  "rosy-bream": "fish8",
  "junk-barrel": "junkBarrel",
  "junk-box": "junkBox",
  "treasure-chest": "treasureChest",
};

function frameAt(timeMs: number, fps: number, frames: number) {
  if (fps <= 0 || frames <= 1) return 0;
  return Math.floor(timeMs / (1_000 / fps)) % frames;
}

function drawAnglerFrame(
  context: CanvasRenderingContext2D,
  assets: FishingAssets,
  spriteId: FishingSpriteId,
  frame: number,
  x: number,
  feetY: number,
  facing: 1 | -1,
) {
  const spec: SpriteSpec = FISHING_SPRITES[spriteId];
  const image = assets[spriteId];
  context.save();
  context.translate(Math.round(x), Math.round(feetY));
  if (facing === -1) context.scale(-1, 1);
  context.drawImage(
    image,
    frame * spec.frameWidth,
    0,
    spec.frameWidth,
    spec.frameHeight,
    -spec.frameWidth / 2,
    -spec.frameHeight,
    spec.frameWidth,
    spec.frameHeight,
  );
  context.restore();
}

interface CastGeometry {
  tipX: number;
  tipY: number;
  bobberX: number;
  bobberY: number;
}

function castGeometry(state: FishingState): CastGeometry {
  const onPier = state.location === "pier";
  const baseX = onPier ? state.playerX : state.boatX;
  const feetY = onPier ? PIER_SURFACE_Y : BOAT_SEAT_FEET_Y;
  const tipX = baseX + state.facing * 16;
  const tipY = feetY - 30;
  return { tipX, tipY, bobberX: tipX + state.facing * 34, bobberY: onPier ? 184 : 193 };
}

function drawSky(context: CanvasRenderingContext2D, ambientTime: number) {
  const bands = ["#f6cd90", "#f0b784", "#e69c7c", "#d9837b", "#c56f82"];
  bands.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(0, index * 30, LAKE_WIDTH, 30);
  });

  context.fillStyle = "#ffe3ae";
  context.fillRect(355, 53, 14, 14);
  context.fillStyle = "rgba(255, 227, 174, 0.35)";
  context.fillRect(358, 46, 8, 28);
  context.fillRect(348, 56, 28, 8);

  const drift = Math.floor((ambientTime / 320) % (LAKE_WIDTH + 160));
  context.fillStyle = "rgba(255, 228, 196, 0.4)";
  context.fillRect(-120 + drift, 34, 56, 5);
  context.fillRect(-96 + drift, 28, 30, 4);
  context.fillRect(LAKE_WIDTH + 40 - drift, 62, 64, 5);
  context.fillRect(LAKE_WIDTH + 62 - drift, 56, 34, 4);
}

function drawHills(context: CanvasRenderingContext2D) {
  context.fillStyle = "#8a5f78";
  context.beginPath();
  context.moveTo(0, HORIZON_Y);
  context.lineTo(0, 132);
  context.lineTo(48, 112);
  context.lineTo(96, 128);
  context.lineTo(150, 106);
  context.lineTo(204, 130);
  context.lineTo(260, 114);
  context.lineTo(320, 132);
  context.lineTo(380, 110);
  context.lineTo(430, 126);
  context.lineTo(480, 116);
  context.lineTo(480, HORIZON_Y);
  context.closePath();
  context.fill();

  context.fillStyle = "#6e4c66";
  context.beginPath();
  context.moveTo(0, HORIZON_Y);
  context.lineTo(0, 142);
  context.lineTo(60, 126);
  context.lineTo(120, 140);
  context.lineTo(190, 124);
  context.lineTo(260, 142);
  context.lineTo(330, 128);
  context.lineTo(400, 144);
  context.lineTo(480, 134);
  context.lineTo(480, HORIZON_Y);
  context.closePath();
  context.fill();
}

function drawWater(context: CanvasRenderingContext2D, assets: FishingAssets, ambientTime: number) {
  const bands = ["#8f7590", "#7d6889", "#6a5b81", "#584f78", "#46436e"];
  bands.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(0, HORIZON_Y + index * 24, LAKE_WIDTH, 24);
  });

  const spec = FISHING_SPRITES.water;
  const frame = frameAt(ambientTime, spec.fps, spec.frames);
  context.save();
  context.globalAlpha = 0.45;
  for (let x = 0; x < LAKE_WIDTH; x += spec.frameWidth) {
    context.drawImage(assets.water, frame * spec.frameWidth, 0, spec.frameWidth, spec.frameHeight, x, HORIZON_Y - 4, spec.frameWidth, spec.frameHeight);
  }
  context.restore();

  context.fillStyle = "rgba(246, 205, 144, 0.28)";
  const shimmer = Math.floor((ambientTime / 260) % 14);
  context.fillRect(340 + shimmer, 156, 34, 1);
  context.fillRect(348 + shimmer / 2, 166, 22, 1);
  context.fillRect(356, 178, 14, 1);

  context.fillStyle = "rgba(233, 220, 200, 0.15)";
  for (let index = 0; index < 6; index += 1) {
    const driftStreak = Math.floor((ambientTime / (210 + index * 31)) % 30);
    context.fillRect(((index * 87 + driftStreak) % 500) - 10, 158 + index * 17, 18 + (index % 3) * 8, 1);
  }
}

function drawBuoys(context: CanvasRenderingContext2D, assets: FishingAssets, ambientTime: number) {
  const bobA = Math.round(Math.sin(ambientTime / 640) * 1);
  const bobB = Math.round(Math.sin(ambientTime / 780 + 2) * 1);
  context.drawImage(assets.buoys, 296, 158 + bobA);
  context.save();
  context.translate(392 + 29, 170 + bobB);
  context.scale(-1, 1);
  context.drawImage(assets.buoys, 0, 0);
  context.restore();
}

function drawFishShadows(context: CanvasRenderingContext2D, state: FishingState, assets: FishingAssets, timeMs: number, ambientTime: number, geometry: CastGeometry) {
  const { activity } = state;
  if (activity !== "waiting" && activity !== "fishBiting" && activity !== "reeling") return;

  context.save();
  if (activity === "waiting") {
    context.globalAlpha = 0.3;
    const swimA = Math.sin(ambientTime / 900);
    const swimB = Math.sin(ambientTime / 1300 + 2);
    drawShadow(context, assets.fish2, geometry.bobberX - 40 + swimA * 18, 208, swimA >= 0 ? 1 : -1);
    drawShadow(context, assets.fish4, geometry.bobberX + 30 + swimB * 22, 228, swimB >= 0 ? -1 : 1);
  } else if (state.hooked) {
    const image = assets[CATCH_IMAGES[state.hooked.id] ?? "fish2"];
    const wiggle = Math.sin(timeMs / 90);
    context.globalAlpha = 0.55;
    if (activity === "fishBiting") {
      drawShadow(context, image, geometry.bobberX + wiggle * 4, 196, wiggle >= 0 ? 1 : -1);
    } else {
      const pull = state.progress / 100;
      const x = geometry.bobberX + (geometry.tipX - geometry.bobberX) * pull * 0.6;
      drawShadow(context, image, x + wiggle * 2, 194 + Math.sin(timeMs / 80) * 2, wiggle >= 0 ? 1 : -1);
    }
  }
  context.restore();
}

function drawShadow(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, direction: 1 | -1) {
  context.save();
  context.translate(Math.round(x), Math.round(y));
  context.scale(direction, 1);
  context.drawImage(image, -image.width / 2, -image.height / 2);
  context.restore();
}

function drawShoreAndHut(context: CanvasRenderingContext2D, assets: FishingAssets) {
  context.drawImage(assets.hut, -34, 58);

  context.fillStyle = "#7d5f49";
  context.beginPath();
  context.moveTo(0, LAKE_HEIGHT);
  context.lineTo(0, SHORE_TOP_Y);
  context.lineTo(132, SHORE_TOP_Y);
  context.lineTo(150, 178);
  context.lineTo(150, LAKE_HEIGHT);
  context.closePath();
  context.fill();

  context.fillStyle = "#a07e5f";
  context.fillRect(0, SHORE_TOP_Y, 132, 2);
  context.fillRect(132, SHORE_TOP_Y, 4, 2);

  context.fillStyle = "#6a4f3c";
  context.fillRect(22, 196, 6, 2);
  context.fillRect(58, 214, 8, 2);
  context.fillRect(96, 188, 5, 2);
  context.fillRect(118, 232, 7, 2);

  const grassY = SHORE_TOP_Y + 2;
  context.drawImage(assets.grass1, 14, grassY - assets.grass1.height);
  context.drawImage(assets.grass2, 56, grassY - assets.grass2.height);
  context.drawImage(assets.grass3, 100, grassY - assets.grass3.height);
  context.drawImage(assets.grass4, 126, grassY - assets.grass4.height);
}

function drawPier(context: CanvasRenderingContext2D) {
  for (let x = PIER_START_X; x < PIER_END_X; x += 6) {
    context.fillStyle = (x / 6) % 2 === 0 ? "#8a6844" : "#7d5c3d";
    context.fillRect(x, PIER_SURFACE_Y, 5, 5);
  }
  context.fillStyle = "#a58154";
  context.fillRect(PIER_START_X, PIER_SURFACE_Y, PIER_END_X - PIER_START_X, 1);

  context.fillStyle = "#5a3f31";
  for (const postX of [144, 168, 192, 208]) {
    context.fillRect(postX, PIER_SURFACE_Y + 5, 4, 20);
  }
  context.fillStyle = "#54382c";
  context.fillRect(PIER_START_X + 4, PIER_SURFACE_Y + 12, PIER_END_X - PIER_START_X - 8, 3);
}

function drawBoat(context: CanvasRenderingContext2D, state: FishingState, assets: FishingAssets, ambientTime: number) {
  const bob = Math.round(Math.sin(ambientTime / 700) * 1);
  const boatTop = BOAT_FLOAT_Y + bob;
  context.drawImage(assets.boat, Math.round(state.boatX - 37), boatTop);
  return boatTop;
}

function drawLineAndBobber(context: CanvasRenderingContext2D, state: FishingState, ambientTime: number, geometry: CastGeometry) {
  const { activity } = state;
  const hasLine = activity === "casting" || activity === "waiting" || activity === "fishBiting" || activity === "reeling";
  if (!hasLine) return;

  let bobberX = geometry.bobberX;
  let bobberY = geometry.bobberY;

  if (activity === "casting") {
    const t = Math.min(1, state.elapsedMs / FISHING_TIMING.castingMs);
    bobberX = geometry.tipX + (geometry.bobberX - geometry.tipX) * t;
    bobberY = geometry.tipY + (geometry.bobberY - geometry.tipY) * t - Math.sin(t * Math.PI) * 26;
  } else {
    bobberY += Math.round(Math.sin(ambientTime / 520) * 1);
  }

  if (activity === "reeling") {
    const pull = state.progress / 100;
    bobberX += (geometry.tipX - bobberX) * pull * 0.5;
    bobberY += (geometry.tipY - bobberY) * pull * 0.25;
  }

  if (activity === "fishBiting") bobberY += 3;

  context.strokeStyle = state.tension > 75 ? "rgba(240, 160, 140, 0.85)" : "rgba(240, 235, 215, 0.55)";
  context.lineWidth = 0.75;
  context.beginPath();
  context.moveTo(geometry.tipX, geometry.tipY);
  context.quadraticCurveTo((geometry.tipX + bobberX) / 2, Math.min(geometry.tipY, bobberY) + 6, bobberX, bobberY);
  context.stroke();

  context.fillStyle = "#d84f45";
  context.fillRect(Math.round(bobberX) - 1, Math.round(bobberY) - 3, 2, 2);
  context.fillStyle = "#f2ead8";
  context.fillRect(Math.round(bobberX) - 1, Math.round(bobberY) - 1, 2, 2);

  if (activity === "fishBiting" && Math.floor(ambientTimeSafe(ambientTime) / 150) % 2 === 0) {
    context.fillStyle = "#f2d38a";
    context.fillRect(Math.round(bobberX) - 1, Math.round(bobberY) - 15, 2, 6);
    context.fillRect(Math.round(bobberX) - 1, Math.round(bobberY) - 7, 2, 2);
  }
}

function ambientTimeSafe(time: number) {
  return time < 0 ? 0 : time;
}

function drawAngler(context: CanvasRenderingContext2D, state: FishingState, assets: FishingAssets, timeMs: number, ambientTime: number, boatTop: number) {
  const { activity } = state;
  if (state.location === "boat") {
    const spec = FISHING_SPRITES.anglerRow;
    if (activity === "rowing") {
      drawAnglerFrame(context, assets, "anglerRow", frameAt(timeMs, spec.fps, spec.frames), state.boatX, boatTop + 5, state.facing);
    } else if (activity === "idle") {
      drawAnglerFrame(context, assets, "anglerRow", frameAt(ambientTime, 2, spec.frames), state.boatX, boatTop + 5, state.facing);
    } else {
      drawFishingPose(context, state, assets, timeMs, ambientTime, state.boatX, boatTop + 5);
    }
    return;
  }

  if (activity === "walking") {
    const spec = FISHING_SPRITES.anglerWalk;
    drawAnglerFrame(context, assets, "anglerWalk", frameAt(timeMs, spec.fps, spec.frames), state.playerX, PIER_SURFACE_Y, state.facing);
  } else if (activity === "idle") {
    const spec = FISHING_SPRITES.anglerIdle;
    drawAnglerFrame(context, assets, "anglerIdle", frameAt(ambientTime, spec.fps, spec.frames), state.playerX, PIER_SURFACE_Y, state.facing);
  } else {
    drawFishingPose(context, state, assets, timeMs, ambientTime, state.playerX, PIER_SURFACE_Y);
  }
}

function drawFishingPose(context: CanvasRenderingContext2D, state: FishingState, assets: FishingAssets, timeMs: number, ambientTime: number, x: number, feetY: number) {
  const { activity } = state;
  if (activity === "casting") {
    const spec = FISHING_SPRITES.anglerHook;
    const frame = Math.min(spec.frames - 1, Math.floor((state.elapsedMs / FISHING_TIMING.castingMs) * spec.frames));
    drawAnglerFrame(context, assets, "anglerHook", frame, x, feetY, state.facing);
    return;
  }
  if (activity === "waiting" || activity === "fishBiting") {
    const spec = FISHING_SPRITES.anglerFish;
    drawAnglerFrame(context, assets, "anglerFish", frameAt(ambientTime, spec.fps, spec.frames), x, feetY, state.facing);
    return;
  }
  if (activity === "reeling") {
    const spec = FISHING_SPRITES.anglerFish;
    drawAnglerFrame(context, assets, "anglerFish", frameAt(timeMs, 6, spec.frames), x, feetY, state.facing);
    return;
  }
  drawAnglerFrame(context, assets, "anglerIdle", 0, x, feetY, state.facing);
}

function drawCatchLeap(context: CanvasRenderingContext2D, state: FishingState, assets: FishingAssets, geometry: CastGeometry) {
  if (state.activity !== "landed" || state.escaped || !state.lastCatch) return;
  const t = Math.min(1, state.elapsedMs / FISHING_TIMING.resultMs);
  const image = assets[CATCH_IMAGES[state.lastCatch.id] ?? "fish2"];
  const isJunk = state.lastCatch.size === "junk" || state.lastCatch.size === "treasure";
  const leap = Math.sin(t * Math.PI) * (isJunk ? 28 : 54);
  const x = geometry.bobberX;
  const y = geometry.bobberY - leap;

  if (t < 0.3) {
    context.fillStyle = "rgba(240, 240, 230, 0.6)";
    context.fillRect(Math.round(geometry.bobberX) - 6, Math.round(geometry.bobberY) - 2, 3, 1);
    context.fillRect(Math.round(geometry.bobberX) + 3, Math.round(geometry.bobberY) - 3, 3, 1);
  }

  context.save();
  context.translate(Math.round(x), Math.round(y));
  if (state.facing === -1) context.scale(-1, 1);
  context.drawImage(image, -image.width / 2, -image.height / 2);
  context.restore();
}

function drawVignette(context: CanvasRenderingContext2D) {
  const vignette = context.createRadialGradient(LAKE_WIDTH / 2, LAKE_HEIGHT / 2, 120, LAKE_WIDTH / 2, LAKE_HEIGHT / 2, 320);
  vignette.addColorStop(0, "rgba(24, 12, 24, 0)");
  vignette.addColorStop(1, "rgba(24, 12, 24, 0.22)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, LAKE_WIDTH, LAKE_HEIGHT);
}

export function drawFishingScene(
  context: CanvasRenderingContext2D,
  state: FishingState,
  assets: FishingAssets,
  timeMs: number,
  reducedMotion: boolean,
) {
  const ambientTime = reducedMotion ? 0 : timeMs;
  context.clearRect(0, 0, LAKE_WIDTH, LAKE_HEIGHT);

  drawSky(context, ambientTime);
  drawHills(context);
  drawWater(context, assets, ambientTime);
  const geometry = castGeometry(state);
  drawBuoys(context, assets, ambientTime);
  drawFishShadows(context, state, assets, timeMs, ambientTime, geometry);
  const boatTop = drawBoat(context, state, assets, ambientTime);
  drawShoreAndHut(context, assets);
  drawPier(context);
  drawAngler(context, state, assets, timeMs, ambientTime, boatTop);
  drawLineAndBobber(context, state, ambientTime, geometry);
  drawCatchLeap(context, state, assets, geometry);
  drawVignette(context);
}
