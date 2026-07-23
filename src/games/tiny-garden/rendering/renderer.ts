import { SOIL_X } from "../domain/rules";
import type { GardenerAnimation, SeedId, TinyGardenState } from "../domain/types";

export const GARDEN_WIDTH = 320;
export const GARDEN_HEIGHT = 180;

interface TinyGardenAssets {
  gardener: HTMLImageElement;
  plants: HTMLImageElement;
  environment: HTMLImageElement;
}

const ASSET_URLS = {
  gardener: "/assets/games/tiny-garden/gardener.png",
  plants: "/assets/games/tiny-garden/plants.png",
  environment: "/assets/games/tiny-garden/environment.png",
} as const;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load Tiny Garden asset: ${source}`));
    image.src = source;
  });
}

export async function loadTinyGardenAssets(): Promise<TinyGardenAssets> {
  const [gardener, plants, environment] = await Promise.all([
    loadImage(ASSET_URLS.gardener),
    loadImage(ASSET_URLS.plants),
    loadImage(ASSET_URLS.environment),
  ]);
  return { gardener, plants, environment };
}

function drawFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  column: number,
  row: number,
  x: number,
  y: number,
  width = 32,
  height = 32,
) {
  context.drawImage(image, column * 32, row * 32, 32, 32, Math.round(x), Math.round(y), width, height);
}

const GARDENER_FRAMES: Record<GardenerAnimation, readonly [number, number][]> = {
  idle: [[0, 0], [1, 0], [2, 0]],
  walking: [[3, 0], [4, 0], [5, 0], [6, 0]],
  kneeling: [[0, 1], [1, 1], [2, 1]],
  planting: [[3, 1], [4, 1], [5, 1], [6, 1]],
  watering: [[0, 2], [1, 2], [2, 2], [3, 2]],
  celebrating: [[4, 2], [5, 2], [6, 2]],
};

const PLANT_ROWS: Record<SeedId, number> = { sunflower: 0, "tiny-flower": 1, "little-bush": 2 };

function drawBackground(context: CanvasRenderingContext2D, timeMs: number, reducedMotion: boolean) {
  const time = reducedMotion ? 0 : timeMs;
  const sky = ["#aebeb0", "#a5b8aa", "#9aafa2", "#90a69a", "#849b90"];
  sky.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(0, index * 24, GARDEN_WIDTH, 24);
  });

  context.fillStyle = "#d8c78f";
  context.fillRect(270, 24, 10, 10);
  context.fillStyle = "rgba(238, 225, 180, 0.44)";
  context.fillRect(266, 28, 18, 2);
  context.fillRect(274, 20, 2, 18);

  const cloudOffset = reducedMotion ? 0 : Math.floor((time / 320) % 55);
  context.fillStyle = "rgba(233, 236, 218, 0.42)";
  context.fillRect(28 + cloudOffset, 34, 42, 5);
  context.fillRect(38 + cloudOffset, 29, 22, 5);

  context.fillStyle = "#657d68";
  context.fillRect(0, 106, GARDEN_WIDTH, 24);
  context.fillStyle = "#536b58";
  context.fillRect(0, 130, GARDEN_WIDTH, 50);
  context.fillStyle = "#405747";
  context.fillRect(0, 151, GARDEN_WIDTH, 29);
  context.fillStyle = "rgba(233, 221, 176, 0.12)";
  for (let x = 4; x < GARDEN_WIDTH; x += 13) context.fillRect(x, 139 + (x % 9), 2, 1);
}

function drawGardener(context: CanvasRenderingContext2D, assets: TinyGardenAssets, state: TinyGardenState, timeMs: number) {
  const frames = GARDENER_FRAMES[state.characterAnimation];
  const speed = state.characterAnimation === "walking" ? 120 : 260;
  const [column, row] = frames[Math.floor(timeMs / speed) % frames.length];
  const x = Math.round(state.characterPosition);
  context.save();
  if (state.characterDirection === "left") {
    context.translate(x, 0);
    context.scale(-1, 1);
    drawFrame(context, assets.gardener, column, row, -16, 108);
  } else {
    drawFrame(context, assets.gardener, column, row, x - 16, 108);
  }
  context.restore();
}

function drawAmbient(context: CanvasRenderingContext2D, assets: TinyGardenAssets, state: TinyGardenState, timeMs: number, reducedMotion: boolean) {
  const time = reducedMotion ? 0 : timeMs + state.ambientOffsetMs;
  const grassFrame = reducedMotion ? 7 : (Math.floor(time / 720) % 2 === 0 ? 7 : 0);
  const grassRow = grassFrame === 7 ? 0 : 1;
  drawFrame(context, assets.environment, grassFrame, grassRow, 8, 113);
  drawFrame(context, assets.environment, grassFrame, grassRow, 292, 116);

  if (state.phase === "bloomed") {
    const butterflyFrame = reducedMotion ? 5 : 5 + Math.floor(time / 180) % 3;
    const butterflyX = reducedMotion ? 258 : 255 + Math.round(Math.sin(time / 640) * 12);
    const butterflyY = reducedMotion ? 64 : 65 + Math.round(Math.sin(time / 420) * 7);
    drawFrame(context, assets.environment, butterflyFrame, 1, butterflyX, butterflyY, 20, 20);
  } else if (!reducedMotion) {
    const progress = (time % 7_000) / 7_000;
    const leafFrame = 1 + Math.floor(time / 260) % 2;
    drawFrame(context, assets.environment, leafFrame, 1, 284 - progress * 110, 48 + progress * 62, 14, 14);
  }
}

function drawPlantAndEffects(context: CanvasRenderingContext2D, assets: TinyGardenAssets, state: TinyGardenState, timeMs: number, reducedMotion: boolean) {
  if (state.soilState === "empty") drawFrame(context, assets.environment, 0, 0, SOIL_X - 16, 116);
  else drawFrame(context, assets.plants, state.growthStage, PLANT_ROWS[state.selectedSeedId], SOIL_X - 16, 108);

  if (state.phase === "watering") {
    const drop = Math.floor(timeMs / 110) % 3;
    context.fillStyle = "#b7d9cf";
    context.fillRect(SOIL_X - 9 + drop * 4, 111 + drop * 3, 2, 3);
  }

  if (state.sparkleRemainingMs > 0) {
    const frame = reducedMotion ? 3 : 3 + Math.floor(timeMs / 160) % 2;
    drawFrame(context, assets.environment, frame, 1, SOIL_X + 9, 79, 18, 18);
  }
}

export function createTinyGardenRenderer(canvas: HTMLCanvasElement, assets: TinyGardenAssets) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas 2D is not available");
  canvas.width = GARDEN_WIDTH;
  canvas.height = GARDEN_HEIGHT;
  context.imageSmoothingEnabled = false;

  return (state: TinyGardenState, timeMs: number, reducedMotion: boolean) => {
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, GARDEN_WIDTH, GARDEN_HEIGHT);
    drawBackground(context, timeMs, reducedMotion);
    drawFrame(context, assets.environment, 5, 0, 278, 70, 48, 48);
    drawFrame(context, assets.environment, 4, 0, 22, 104, 48, 48);
    drawFrame(context, assets.environment, 6, 0, 176, 126, 18, 18);
    drawAmbient(context, assets, state, timeMs, reducedMotion);
    drawPlantAndEffects(context, assets, state, timeMs, reducedMotion);
    drawGardener(context, assets, state, timeMs);

    context.fillStyle = "rgba(8, 24, 20, 0.14)";
    context.fillRect(0, 0, GARDEN_WIDTH, GARDEN_HEIGHT);
  };
}
