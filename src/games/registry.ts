import type { HeroGameDefinition } from "./core/types";

export const HERO_GAMES = {
  "tiny-garden": {
    id: "tiny-garden",
    name: "Tiny Garden",
    ariaLabel: "Playable tiny pixel garden",
    errorMessage: "The garden could not load. The portfolio is still available.",
    presentation: "embedded",
    capabilities: {
      sound: false,
      pauseOffscreen: true,
      touchFullscreen: false,
    },
    transition: {
      revealMs: 220,
      exitMs: 180,
    },
    load: () => import("./tiny-garden/adapter"),
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
      revealMs: 650,
      exitMs: 650,
    },
    load: () => import("./pixel-fighter/adapter"),
  },
  "pixel-fishing": {
    id: "pixel-fishing",
    name: "Pixel Fishing",
    ariaLabel: "Playable pixel fishing game",
    errorMessage: "The fishing game could not load. The portfolio is still available.",
    presentation: "embedded",
    capabilities: {
      sound: false,
      pauseOffscreen: true,
      touchFullscreen: false,
    },
    transition: {
      revealMs: 220,
      exitMs: 180,
    },
    load: () => import("./pixel-fishing/adapter"),
  },
  "pixel-artillery": {
    id: "pixel-artillery",
    name: "Pixel Artillery",
    ariaLabel: "Playable pixel artillery game",
    errorMessage: "The artillery game could not load. The portfolio is still available.",
    presentation: "embedded",
    capabilities: {
      sound: false,
      pauseOffscreen: true,
      touchFullscreen: false,
    },
    transition: {
      revealMs: 220,
      exitMs: 180,
    },
    load: () => import("./pixel-artillery/adapter"),
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
export const ACTIVE_HERO_GAME_ID: HeroGameId = "pixel-fighter";

export function getHeroGameDefinition(id: HeroGameId): HeroGameDefinition {
  return selectHeroGame(HERO_GAMES, id);
}

export const ACTIVE_HERO_GAME = getHeroGameDefinition(ACTIVE_HERO_GAME_ID);
