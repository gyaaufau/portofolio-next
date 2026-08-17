export interface SpriteSpec {
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  fps: number;
}

export const FISHING_SPRITES = {
  anglerIdle: { url: "/assets/games/fishing/characters/fisherman-idle.png", frameWidth: 48, frameHeight: 48, frames: 4, fps: 4 },
  anglerWalk: { url: "/assets/games/fishing/characters/fisherman-walk.png", frameWidth: 48, frameHeight: 48, frames: 6, fps: 9 },
  anglerFish: { url: "/assets/games/fishing/characters/fisherman-fish.png", frameWidth: 48, frameHeight: 48, frames: 4, fps: 4 },
  anglerHook: { url: "/assets/games/fishing/characters/fisherman-hook.png", frameWidth: 48, frameHeight: 48, frames: 6, fps: 10 },
  anglerRow: { url: "/assets/games/fishing/characters/fisherman-row.png", frameWidth: 48, frameHeight: 48, frames: 4, fps: 5 },
  water: { url: "/assets/games/fishing/environment/water.png", frameWidth: 32, frameHeight: 32, frames: 3, fps: 3 },
} as const satisfies Record<string, SpriteSpec>;

export type FishingSpriteId = keyof typeof FISHING_SPRITES;

export const FISHING_STATICS = {
  hut: "/assets/games/fishing/environment/fishing-hut.png",
  pierTiles: "/assets/games/fishing/environment/pier-tiles.png",
  boat: "/assets/games/fishing/environment/boat.png",
  grass1: "/assets/games/fishing/environment/grass-1.png",
  grass2: "/assets/games/fishing/environment/grass-2.png",
  grass3: "/assets/games/fishing/environment/grass-3.png",
  grass4: "/assets/games/fishing/environment/grass-4.png",
  buoys: "/assets/games/fishing/environment/buoys.png",
  fish1: "/assets/games/fishing/catch/fish-1.png",
  fish2: "/assets/games/fishing/catch/fish-2.png",
  fish3: "/assets/games/fishing/catch/fish-3.png",
  fish4: "/assets/games/fishing/catch/fish-4.png",
  fish5: "/assets/games/fishing/catch/fish-5.png",
  fish6: "/assets/games/fishing/catch/fish-6.png",
  fish7: "/assets/games/fishing/catch/fish-7.png",
  fish8: "/assets/games/fishing/catch/fish-8.png",
  junkBarrel: "/assets/games/fishing/catch/junk-barrel.png",
  junkBox: "/assets/games/fishing/catch/junk-box.png",
  treasureChest: "/assets/games/fishing/catch/treasure-chest.png",
  fishbarrel1: "/assets/games/fishing/props/fishbarrel-1.png",
  fishbarrel2: "/assets/games/fishing/props/fishbarrel-2.png",
  fishbarrel3: "/assets/games/fishing/props/fishbarrel-3.png",
  fishbarrel4: "/assets/games/fishing/props/fishbarrel-4.png",
} as const;

export type FishingStaticId = keyof typeof FISHING_STATICS;
export type FishingAssetId = FishingSpriteId | FishingStaticId;
export type FishingAssets = Record<FishingAssetId, HTMLImageElement>;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load Pixel Fishing asset: ${source}`));
    image.src = source;
  });
}

export async function loadFishingAssets(): Promise<FishingAssets> {
  const entries: [FishingAssetId, string][] = [
    ...(Object.keys(FISHING_SPRITES) as FishingSpriteId[]).map((key) => [key, FISHING_SPRITES[key].url] as [FishingAssetId, string]),
    ...(Object.entries(FISHING_STATICS) as [FishingStaticId, string][]),
  ];
  const loaded = await Promise.all(entries.map(async ([key, url]) => [key, await loadImage(url)] as const));
  return Object.fromEntries(loaded) as FishingAssets;
}

/** Session haul meter: barrel fills as the haul grows (0 / 1-2 / 3-5 / 6+). */
export function barrelSpriteForHaul(count: number): string {
  if (count <= 0) return FISHING_STATICS.fishbarrel1;
  if (count <= 2) return FISHING_STATICS.fishbarrel2;
  if (count <= 5) return FISHING_STATICS.fishbarrel3;
  return FISHING_STATICS.fishbarrel4;
}
