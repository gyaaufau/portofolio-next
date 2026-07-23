export type SeedId = "sunflower" | "tiny-flower" | "little-bush";

export type TinyGardenPhase =
  | "idle"
  | "seedSelection"
  | "carryingSeed"
  | "planting"
  | "planted"
  | "watering"
  | "growing"
  | "bloomed";

export type GardenerAnimation = "idle" | "walking" | "kneeling" | "planting" | "watering" | "celebrating";
export type GardenerDirection = "left" | "right";
export type SoilState = "empty" | "planted";
export type GrowthStage = 0 | 1 | 2 | 3 | 4;
export type WateringCount = 0 | 1 | 2 | 3;
export type MoveIntent = -1 | 0 | 1;

export interface TinyGardenState {
  phase: TinyGardenPhase;
  selectedSeedId: SeedId;
  characterPosition: number;
  characterDirection: GardenerDirection;
  characterAnimation: GardenerAnimation;
  moveIntent: MoveIntent;
  soilState: SoilState;
  growthStage: GrowthStage;
  wateringCount: WateringCount;
  actionElapsedMs: number;
  actionCooldownMs: number;
  ambientOffsetMs: number;
  sparkleRemainingMs: number;
  resultMessage: string | null;
}

export type TinyGardenEvent =
  | { type: "activate"; random: number }
  | { type: "deactivate" }
  | { type: "selectSeed"; seedId: SeedId }
  | { type: "cycleSeed"; direction: -1 | 1 }
  | { type: "confirmSeed" }
  | { type: "move"; direction: -1 | 1 }
  | { type: "stopMoving" }
  | { type: "action" }
  | { type: "tick"; deltaMs: number; random: number }
  | { type: "restart"; random: number };

export interface TinyGardenSnapshot {
  phase: TinyGardenPhase;
  selectedSeedId: SeedId;
  growthStage: GrowthStage;
  wateringCount: WateringCount;
  isNearSoil: boolean;
  status: string;
  actionLabel: string;
}
