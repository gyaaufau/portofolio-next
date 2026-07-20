import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const assetRoot = path.join(projectRoot, "public", "FIGHTGAME_Assets");
const outputRoot = path.join(projectRoot, "public", "games", "pixel-fighter", "generated");
const maxAtlasWidth = 1024;
const padding = 2;

async function listPngs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listPngs(absolute));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) files.push(absolute);
  }
  return files.sort();
}

async function buildAtlas(name, roots, { normalizeCharacters = false } = {}) {
  const sources = [];
  for (const root of roots) {
    const absoluteRoot = path.join(assetRoot, root);
    for (const file of await listPngs(absoluteRoot)) {
      const metadata = await sharp(file).metadata();
      if (!metadata.width || !metadata.height) continue;
      sources.push({
        file,
        key: path.relative(assetRoot, file).split(path.sep).join("/"),
        width: metadata.width,
        height: metadata.height,
        sourceWidth: metadata.width,
        sourceHeight: metadata.height,
      });
    }
  }

  if (normalizeCharacters) {
    const bounds = new Map();
    for (const source of sources) {
      const character = source.key.split("/")[1];
      const current = bounds.get(character) ?? { width: 0, height: 0 };
      bounds.set(character, {
        width: Math.max(current.width, source.width),
        height: Math.max(current.height, source.height),
      });
    }
    for (const source of sources) {
      const character = source.key.split("/")[1];
      const size = bounds.get(character);
      source.offsetX = Math.floor((size.width - source.width) / 2);
      source.offsetY = size.height - source.height;
      source.width = size.width;
      source.height = size.height;
    }
  }

  sources.sort((a, b) => b.height - a.height || b.width - a.width || a.key.localeCompare(b.key));
  let x = padding;
  let y = padding;
  let rowHeight = 0;
  let atlasWidth = 0;
  const placed = [];

  for (const source of sources) {
    if (x + source.width + padding > maxAtlasWidth && x > padding) {
      x = padding;
      y += rowHeight + padding;
      rowHeight = 0;
    }
    placed.push({ ...source, x, y });
    x += source.width + padding;
    rowHeight = Math.max(rowHeight, source.height);
    atlasWidth = Math.max(atlasWidth, x);
  }

  const atlasHeight = y + rowHeight + padding;
  const width = Math.max(2, Math.min(maxAtlasWidth, atlasWidth));
  const height = Math.max(2, atlasHeight);
  const composites = await Promise.all(placed.map(async (item) => ({
    input: normalizeCharacters
      ? await sharp({ create: { width: item.width, height: item.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: item.file, left: item.offsetX, top: item.offsetY }])
        .png()
        .toBuffer()
      : item.file,
    left: item.x,
    top: item.y,
  })));
  await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composites)
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(outputRoot, `${name}.png`));

  const frames = Object.fromEntries(placed.map((item) => [item.key, {
    frame: { x: item.x, y: item.y, w: item.width, h: item.height },
    rotated: false,
    trimmed: false,
    spriteSourceSize: { x: item.offsetX ?? 0, y: item.offsetY ?? 0, w: item.sourceWidth, h: item.sourceHeight },
    sourceSize: { w: item.width, h: item.height },
    pivot: { x: 0.5, y: 1 },
  }]));

  await writeFile(path.join(outputRoot, `${name}.json`), JSON.stringify({
    frames,
    meta: {
      app: "gialoop-fightgame-atlas",
      version: "1.0",
      image: `${name}.png`,
      format: "RGBA8888",
      size: { w: width, h: height },
      scale: "1",
    },
  }, null, 2));
}

await mkdir(outputRoot, { recursive: true });
await buildAtlas("characters", ["CHARAs"], { normalizeCharacters: true });
await buildAtlas("environment", ["ENVIRO", "POSTPRO"]);
await buildAtlas("effects", [
  "FXs/impact1",
  "FXs/impact2",
  "FXs/impact3",
  "FXs/impactHUGE",
  "FXs/smoke1",
  "FXs/smoke2",
  "FXs/smoke3",
  "FXs/smoke4",
  "FXs/smoke5",
  "FXs/smoke6",
  "FXs/snow1",
  "FXs/snow2",
  "FXs/snow3",
  "FXs/Speed_OnScreen",
]);
await buildAtlas("finishers", ["FXs/OUT!", "FXs/OUT!_NoGlow"]);
await buildAtlas("items", ["ITEMs"]);
