export type FishingPhase = "idle" | "casting" | "waiting" | "fishBiting" | "reeling" | "caught" | "escaped";

export interface FishDefinition {
  id: "bluegill" | "river-perch" | "tiny-koi" | "golden-carp";
  name: string;
  color: string;
  accent: string;
}

export interface FishingState {
  phase: FishingPhase;
  elapsedMs: number;
  waitMs: number;
  progress: number;
  tension: number;
  reeling: boolean;
  fish: FishDefinition | null;
}

export type FishingEvent =
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

export const FISH: readonly FishDefinition[] = [
  { id: "bluegill", name: "Bluegill", color: "#5d8f9d", accent: "#d7b67a" },
  { id: "river-perch", name: "River Perch", color: "#78905d", accent: "#d7c96e" },
  { id: "tiny-koi", name: "Tiny Koi", color: "#f1eee2", accent: "#d47b55" },
  { id: "golden-carp", name: "Golden Carp", color: "#d3a95d", accent: "#f0d98a" },
] as const;

const clampUnit = (value: number) => Math.min(0.999_999, Math.max(0, value));
const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export function createInitialFishingState(): FishingState {
  return { phase: "idle", elapsedMs: 0, waitMs: 0, progress: 0, tension: 0, reeling: false, fish: null };
}

export function chooseFish(random: number) {
  return FISH[Math.floor(clampUnit(random) * FISH.length)];
}

export function chooseWaitMs(random: number) {
  return FISHING_TIMING.waitMinMs + clampUnit(random) * (FISHING_TIMING.waitMaxMs - FISHING_TIMING.waitMinMs);
}

export function fishingStatus(state: FishingState) {
  switch (state.phase) {
    case "idle": return "The lake is calm. Cast when you are ready.";
    case "casting": return "Casting the line.";
    case "waiting": return "Waiting for a bite.";
    case "fishBiting": return "A fish is biting. Hook it now!";
    case "reeling": return state.reeling ? "Reeling in. Watch the line tension." : "Letting the line relax.";
    case "caught": return `You caught a ${state.fish?.name ?? "fish"}.`;
    case "escaped": return "The fish slipped away.";
  }
}

export function reduceFishingState(state: FishingState, event: FishingEvent): FishingState {
  if (event.type === "reset") return createInitialFishingState();
  if (event.type === "cast" && state.phase === "idle") {
    return { ...createInitialFishingState(), phase: "casting", waitMs: chooseWaitMs(event.random) };
  }
  if (event.type === "press") {
    if (state.phase === "fishBiting") {
      return { ...state, phase: "reeling", elapsedMs: 0, progress: 0, tension: FISHING_RATES.initialTension, reeling: true };
    }
    if (state.phase === "reeling") return { ...state, reeling: true };
    return state;
  }
  if (event.type === "release") return state.phase === "reeling" ? { ...state, reeling: false } : state;
  if (event.type !== "tick") return state;

  const deltaMs = Math.max(0, Math.min(event.deltaMs, 100));
  const elapsedMs = state.elapsedMs + deltaMs;
  if (state.phase === "casting" && elapsedMs >= FISHING_TIMING.castingMs) {
    return { ...state, phase: "waiting", elapsedMs: 0 };
  }
  if (state.phase === "waiting" && elapsedMs >= state.waitMs) {
    return { ...state, phase: "fishBiting", elapsedMs: 0 };
  }
  if (state.phase === "fishBiting" && elapsedMs >= FISHING_TIMING.biteMs) {
    return { ...state, phase: "escaped", elapsedMs: 0, reeling: false };
  }
  if (state.phase === "reeling") {
    const seconds = deltaMs / 1_000;
    const progress = clampPercent(state.progress + (state.reeling ? FISHING_RATES.progressPerSecond * seconds : 0));
    const tension = clampPercent(state.tension + (state.reeling ? FISHING_RATES.tensionRisePerSecond : -FISHING_RATES.tensionFallPerSecond) * seconds);
    if (tension >= 100 || elapsedMs >= FISHING_TIMING.reelingMs) {
      return { ...state, phase: "escaped", elapsedMs: 0, progress, tension, reeling: false };
    }
    if (progress >= 100) {
      return { ...state, phase: "caught", elapsedMs: 0, progress, tension, reeling: false, fish: chooseFish(event.random) };
    }
    return { ...state, elapsedMs, progress, tension };
  }
  if ((state.phase === "caught" || state.phase === "escaped") && elapsedMs >= FISHING_TIMING.resultMs) {
    return createInitialFishingState();
  }
  return { ...state, elapsedMs };
}
