import type { HeroGameDefinition } from "./core/types";

export const HERO_GAMES = {
  "pixel-fishing": {
    id: "pixel-fishing",
    name: "Quiet Cast",
    ariaLabel: "Cozy pixel fishing game",
    errorMessage: "The lake could not load. The portfolio is still available.",
    presentation: "embedded",
    capabilities: {
      sound: false,
      pauseOffscreen: true,
      touchFullscreen: false,
    },
    transition: {
      revealMs: 240,
      exitMs: 180,
    },
    load: () => import("./pixel-fishing/adapter"),
  },
  "pixel-artillery": {
    id: "pixel-artillery",
    name: "Tiny Artillery",
    ariaLabel: "Tiny Artillery, a turn-based pixel ant duel",
    errorMessage: "The artillery duel could not load. The battlefield preview is still available.",
    capabilities: {
      sound: false,
      pauseOffscreen: true,
      touchFullscreen: true,
    },
    transition: {
      revealMs: 560,
      exitMs: 480,
    },
    load: () => import("./pixel-artillery/adapter"),
  },
  "pixel-fighter": {
    id: "pixel-fighter",
    name: "Pixel Duel",
    ariaLabel: "Playable pixel fighter",
    errorMessage: "Arena could not load. The fighter preview is still available.",
    presentation: "immersive",
    capabilities: {
      sound: true,
      pauseOffscreen: true,
      touchFullscreen: true,
    },
    transition: {
      revealMs: 700,
      exitMs: 650,
    },
    load: () => import("./pixel-fighter/adapter"),
  },
} as const satisfies Record<string, HeroGameDefinition>;

export type HeroGameId = keyof typeof HERO_GAMES;

export function validateHeroGameRegistry(registry: Record<string, HeroGameDefinition>) {
  const ids = Object.keys(registry);
  return ids.length > 0 && new Set(ids).size === ids.length && ids.every((id) => registry[id].id === id);
}

export function selectHeroGame<TRegistry extends Record<string, HeroGameDefinition>, TId extends keyof TRegistry>(
  registry: TRegistry,
  id: TId,
) {
  return registry[id];
}

/** Change this one typed value to select a different registered hero game. */
export const ACTIVE_HERO_GAME_ID: HeroGameId = "pixel-artillery";

export function getHeroGameDefinition(id: HeroGameId): HeroGameDefinition {
  return selectHeroGame(HERO_GAMES, id);
}

export const ACTIVE_HERO_GAME = getHeroGameDefinition(ACTIVE_HERO_GAME_ID);
