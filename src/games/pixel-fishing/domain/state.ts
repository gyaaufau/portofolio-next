export type ZoneId = "shore" | "mid" | "deep";
export type PlayerLocation = "pier" | "boat";
export type FishingActivity =
  | "idle"
  | "walking"
  | "rowing"
  | "casting"
  | "waiting"
  | "fishBiting"
  | "reeling"
  | "landed";
export type CatchSize = "tiny" | "small" | "medium" | "large" | "huge" | "junk" | "treasure";

export interface CatchDefinition {
  id: string;
  name: string;
  /** Public URL used by the adapter catch card. The renderer maps `id` to a loaded image. */
  sprite: string;
  size: CatchSize;
  tensionMultiplier: number;
  flavor: string;
}

export interface FishingState {
  location: PlayerLocation;
  activity: FishingActivity;
  facing: 1 | -1;
  playerX: number;
  boatX: number;
  moveDirection: -1 | 0 | 1;
  zone: ZoneId;
  elapsedMs: number;
  waitMs: number;
  progress: number;
  tension: number;
  reeling: boolean;
  hooked: CatchDefinition | null;
  lastCatch: CatchDefinition | null;
  escaped: boolean;
  haul: string[];
}

export type FishingEvent =
  | { type: "moveStart"; direction: -1 | 1 }
  | { type: "moveStop" }
  | { type: "interact" }
  | { type: "cast"; random: number }
  | { type: "press" }
  | { type: "release" }
  | { type: "tick"; deltaMs: number; random: number }
  | { type: "reset" };

export const FISHING_TIMING = {
  castingMs: 600,
  waitMinMs: 1_500,
  waitMaxMs: 4_000,
  biteMs: 1_000,
  reelingMs: 12_000,
  resultMs: 1_600,
} as const;

export const FISHING_RATES = {
  progressPerSecond: 28,
  tensionRisePerSecond: 38,
  tensionFallPerSecond: 48,
  initialTension: 20,
} as const;

export const WALK_SPEED = 28;
export const ROW_SPEED = 34;
export const PIER_MIN_X = 36;
export const PIER_MAX_X = 204;
export const BOAT_MIN_X = 140;
export const BOAT_MAX_X = 444;
export const BOAT_DOCK_X = 218;
export const BOARD_RANGE = 28;
export const DISEMBARK_MAX_X = 240;
export const DEEP_MIN_X = 330;
export const HAUL_LIMIT = 12;

const CATCH_ASSETS = "/assets/games/fishing/catch";

export const CATCHES: readonly CatchDefinition[] = [
  { id: "pond-minnow", name: "Pond Minnow", sprite: `${CATCH_ASSETS}/fish-1.png`, size: "tiny", tensionMultiplier: 0.8, flavor: "A brave little nibbler." },
  { id: "sunny-perch", name: "Sunny Perch", sprite: `${CATCH_ASSETS}/fish-2.png`, size: "small", tensionMultiplier: 0.9, flavor: "It glints like late-afternoon sun." },
  { id: "copper-salmon", name: "Copper Salmon", sprite: `${CATCH_ASSETS}/fish-3.png`, size: "small", tensionMultiplier: 0.9, flavor: "Warm copper scales, cool lake water." },
  { id: "silver-dace", name: "Silver Dace", sprite: `${CATCH_ASSETS}/fish-4.png`, size: "medium", tensionMultiplier: 1, flavor: "Quick as a skipped stone." },
  { id: "red-crab", name: "Red Crab", sprite: `${CATCH_ASSETS}/fish-5.png`, size: "medium", tensionMultiplier: 1, flavor: "It pinched the line on purpose." },
  { id: "reed-pike", name: "Reed Pike", sprite: `${CATCH_ASSETS}/fish-7.png`, size: "large", tensionMultiplier: 1.15, flavor: "A shadow between the reeds." },
  { id: "rosy-bream", name: "Rosy Bream", sprite: `${CATCH_ASSETS}/fish-8.png`, size: "large", tensionMultiplier: 1.15, flavor: "Blushing deeper than the sunset." },
  { id: "lake-shark", name: "Lake Shark", sprite: `${CATCH_ASSETS}/fish-6.png`, size: "huge", tensionMultiplier: 1.3, flavor: "The old stories were true." },
  { id: "junk-barrel", name: "Weathered Barrel", sprite: `${CATCH_ASSETS}/junk-barrel.png`, size: "junk", tensionMultiplier: 1, flavor: "Someone's lost lunch storage." },
  { id: "junk-box", name: "Soggy Crate", sprite: `${CATCH_ASSETS}/junk-box.png`, size: "junk", tensionMultiplier: 1, flavor: "Contents: lake. Just lake." },
  { id: "treasure-chest", name: "Sunken Chest", sprite: `${CATCH_ASSETS}/treasure-chest.png`, size: "treasure", tensionMultiplier: 1.2, flavor: "Heavy with quiet-lake secrets." },
] as const;

const CATCH_BY_ID: Record<string, CatchDefinition> = Object.fromEntries(CATCHES.map((definition) => [definition.id, definition]));

export const CATCH_TABLES: Record<ZoneId, readonly { id: string; weight: number }[]> = {
  shore: [
    { id: "pond-minnow", weight: 30 },
    { id: "sunny-perch", weight: 25 },
    { id: "copper-salmon", weight: 20 },
    { id: "red-crab", weight: 5 },
    { id: "junk-barrel", weight: 12 },
    { id: "junk-box", weight: 8 },
  ],
  mid: [
    { id: "sunny-perch", weight: 15 },
    { id: "copper-salmon", weight: 15 },
    { id: "silver-dace", weight: 25 },
    { id: "red-crab", weight: 10 },
    { id: "reed-pike", weight: 20 },
    { id: "junk-barrel", weight: 8 },
    { id: "junk-box", weight: 7 },
  ],
  deep: [
    { id: "silver-dace", weight: 15 },
    { id: "reed-pike", weight: 25 },
    { id: "rosy-bream", weight: 25 },
    { id: "lake-shark", weight: 8 },
    { id: "treasure-chest", weight: 2 },
  ],
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampUnit = (value: number) => clamp(value, 0, 0.999_999);
const clampPercent = (value: number) => clamp(value, 0, 100);
const isMovementActivity = (activity: FishingActivity) => activity === "idle" || activity === "walking" || activity === "rowing";

export function createInitialFishingState(): FishingState {
  return {
    location: "pier",
    activity: "idle",
    facing: 1,
    playerX: 96,
    boatX: BOAT_DOCK_X,
    moveDirection: 0,
    zone: "shore",
    elapsedMs: 0,
    waitMs: 0,
    progress: 0,
    tension: 0,
    reeling: false,
    hooked: null,
    lastCatch: null,
    escaped: false,
    haul: [],
  };
}

export function zoneForPosition(location: PlayerLocation, x: number): ZoneId {
  if (location === "pier") return "shore";
  return x >= DEEP_MIN_X ? "deep" : "mid";
}

export function chooseWaitMs(random: number) {
  return FISHING_TIMING.waitMinMs + clampUnit(random) * (FISHING_TIMING.waitMaxMs - FISHING_TIMING.waitMinMs);
}

export function chooseCatch(zone: ZoneId, random: number): CatchDefinition {
  const table = CATCH_TABLES[zone];
  const total = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = clampUnit(random) * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll < 0) return CATCH_BY_ID[entry.id];
  }
  return CATCH_BY_ID[table[table.length - 1].id];
}

export function canBoard(state: FishingState) {
  return state.location === "pier" && isMovementActivity(state.activity) && Math.abs(state.playerX - state.boatX) < BOARD_RANGE;
}

export function canDisembark(state: FishingState) {
  return state.location === "boat" && isMovementActivity(state.activity) && state.boatX <= DISEMBARK_MAX_X;
}

export type ActionHint = "board" | "disembark" | "cast" | "hook" | "reel" | "wait" | "none";

export function actionHint(state: FishingState): ActionHint {
  if (state.activity === "idle" || state.activity === "walking" || state.activity === "rowing") {
    if (canBoard(state)) return "board";
    if (canDisembark(state)) return "disembark";
    return state.activity === "idle" ? "cast" : "none";
  }
  if (state.activity === "fishBiting") return "hook";
  if (state.activity === "reeling") return "reel";
  if (state.activity === "casting" || state.activity === "waiting") return "wait";
  return "none";
}

export function fishingStatus(state: FishingState): string {
  switch (state.activity) {
    case "idle":
      if (state.location === "pier") {
        return canBoard(state)
          ? "The boat rocks gently. Board it or cast from the pier."
          : "The lake is calm. Walk the pier or cast a line.";
      }
      return canDisembark(state)
        ? "Back at the pier. Go ashore or cast from the boat."
        : "Open water. Row deeper or cast right here.";
    case "walking":
      return "Strolling along the pier.";
    case "rowing":
      return "Rowing across the quiet lake.";
    case "casting":
      return "Casting the line.";
    case "waiting":
      return "Waiting for a bite.";
    case "fishBiting":
      return "A fish is biting. Hook it now!";
    case "reeling":
      return state.reeling ? "Reeling in. Watch the line tension." : "Letting the line relax.";
    case "landed":
      if (state.escaped) return "The fish slipped away.";
      if (!state.lastCatch) return "The lake settles.";
      if (state.lastCatch.size === "junk") return `You hauled up a ${state.lastCatch.name}.`;
      if (state.lastCatch.size === "treasure") return `You raised a ${state.lastCatch.name}!`;
      return `You caught a ${state.lastCatch.name}.`;
  }
}

export function reduceFishingState(state: FishingState, event: FishingEvent): FishingState {
  if (event.type === "reset") return createInitialFishingState();

  if (event.type === "moveStart") {
    if (!isMovementActivity(state.activity)) return state;
    if (state.moveDirection === event.direction && (state.activity === "walking" || state.activity === "rowing")) return state;
    return {
      ...state,
      activity: state.location === "pier" ? "walking" : "rowing",
      moveDirection: event.direction,
      facing: event.direction,
    };
  }

  if (event.type === "moveStop") {
    if (state.activity !== "walking" && state.activity !== "rowing") return state;
    return { ...state, activity: "idle", moveDirection: 0 };
  }

  if (event.type === "interact") {
    if (canBoard(state)) {
      return { ...state, location: "boat", activity: "idle", moveDirection: 0, elapsedMs: 0 };
    }
    if (canDisembark(state)) {
      return {
        ...state,
        location: "pier",
        activity: "idle",
        moveDirection: 0,
        playerX: clamp(state.boatX - 14, PIER_MIN_X, PIER_MAX_X),
        facing: -1,
        elapsedMs: 0,
      };
    }
    return state;
  }

  if (event.type === "cast") {
    if (state.activity !== "idle") return state;
    return {
      ...state,
      activity: "casting",
      zone: zoneForPosition(state.location, state.location === "pier" ? state.playerX : state.boatX),
      elapsedMs: 0,
      waitMs: chooseWaitMs(event.random),
      progress: 0,
      tension: 0,
      reeling: false,
      hooked: null,
      lastCatch: null,
      escaped: false,
    };
  }

  if (event.type === "press") {
    if (state.activity === "fishBiting") {
      return { ...state, activity: "reeling", elapsedMs: 0, progress: 0, tension: FISHING_RATES.initialTension, reeling: true };
    }
    if (state.activity === "reeling") return { ...state, reeling: true };
    return state;
  }

  if (event.type === "release") {
    return state.activity === "reeling" ? { ...state, reeling: false } : state;
  }

  if (event.type !== "tick") return state;
  const deltaMs = clamp(event.deltaMs, 0, 100);

  if (state.activity === "walking") {
    const playerX = clamp(state.playerX + state.moveDirection * WALK_SPEED * (deltaMs / 1_000), PIER_MIN_X, PIER_MAX_X);
    return { ...state, playerX };
  }

  if (state.activity === "rowing") {
    const boatX = clamp(state.boatX + state.moveDirection * ROW_SPEED * (deltaMs / 1_000), BOAT_MIN_X, BOAT_MAX_X);
    return { ...state, boatX };
  }

  if (state.activity === "idle") return state;

  const elapsedMs = state.elapsedMs + deltaMs;

  if (state.activity === "casting" && elapsedMs >= FISHING_TIMING.castingMs) {
    return { ...state, activity: "waiting", elapsedMs: 0 };
  }

  if (state.activity === "waiting" && elapsedMs >= state.waitMs) {
    return { ...state, activity: "fishBiting", elapsedMs: 0, hooked: chooseCatch(state.zone, event.random) };
  }

  if (state.activity === "fishBiting" && elapsedMs >= FISHING_TIMING.biteMs) {
    return { ...state, activity: "landed", elapsedMs: 0, hooked: null, reeling: false, escaped: true };
  }

  if (state.activity === "reeling") {
    const seconds = deltaMs / 1_000;
    const multiplier = state.hooked?.tensionMultiplier ?? 1;
    const progress = clampPercent(state.progress + (state.reeling ? FISHING_RATES.progressPerSecond * seconds : 0));
    const tension = clampPercent(
      state.tension + (state.reeling ? FISHING_RATES.tensionRisePerSecond * multiplier : -FISHING_RATES.tensionFallPerSecond) * seconds,
    );
    if (tension >= 100 || elapsedMs >= FISHING_TIMING.reelingMs) {
      return { ...state, activity: "landed", elapsedMs: 0, progress, tension, reeling: false, hooked: null, escaped: true };
    }
    if (progress >= 100) {
      const caught = state.hooked;
      const haul = caught && state.haul.length < HAUL_LIMIT ? [...state.haul, caught.id] : state.haul;
      return { ...state, activity: "landed", elapsedMs: 0, progress, tension, reeling: false, hooked: null, escaped: false, lastCatch: caught, haul };
    }
    return { ...state, elapsedMs, progress, tension };
  }

  if (state.activity === "landed" && elapsedMs >= FISHING_TIMING.resultMs) {
    return { ...state, activity: "idle", elapsedMs: 0, progress: 0, tension: 0, reeling: false };
  }

  return { ...state, elapsedMs };
}
