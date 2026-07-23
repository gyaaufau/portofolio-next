import type { SeedId } from "./types";

export interface SeedDefinition {
  id: SeedId;
  name: string;
  shortName: string;
  accent: string;
}

export const SEEDS: readonly SeedDefinition[] = [
  { id: "sunflower", name: "Sunflower", shortName: "Sun", accent: "#d9b85e" },
  { id: "tiny-flower", name: "Tiny Flower", shortName: "Flower", accent: "#d98268" },
  { id: "little-bush", name: "Little Bush", shortName: "Bush", accent: "#7f9a62" },
] as const;

export const SEED_IDS = SEEDS.map((seed) => seed.id);

export function getSeedDefinition(seedId: SeedId) {
  return SEEDS.find((seed) => seed.id === seedId) ?? SEEDS[0];
}
