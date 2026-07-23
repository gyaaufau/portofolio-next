import type { HeroGamePhase, HeroGamePresentation } from "./types";

export type HeroGameLifecycleEvent =
  | { type: "play"; ready: boolean }
  | { type: "ready"; playRequested: boolean }
  | { type: "revealed" }
  | { type: "exit" }
  | { type: "exited" }
  | { type: "error" }
  | { type: "retry" };

export function reduceHeroGamePhase(phase: HeroGamePhase, event: HeroGameLifecycleEvent): HeroGamePhase {
  if (event.type === "error") return "error";
  if (event.type === "retry") return "preview";
  if (event.type === "play" && (phase === "preview" || phase === "loading")) return event.ready ? "revealing" : "loading";
  if (event.type === "ready" && phase === "loading" && event.playRequested) return "revealing";
  if (event.type === "revealed" && phase === "revealing") return "active";
  if (event.type === "exit" && (phase === "revealing" || phase === "active")) return "exiting";
  if (event.type === "exited" && phase === "exiting") return "preview";
  return phase;
}

export function isHeroGameImmersive(phase: HeroGamePhase) {
  return phase === "revealing" || phase === "active" || phase === "exiting";
}

export function shouldUseImmersivePresentation(phase: HeroGamePhase, presentation: HeroGamePresentation) {
  return presentation === "immersive" && isHeroGameImmersive(phase);
}

export function shouldPauseHeroGame({
  phase,
  inViewport,
  documentVisible,
  pauseOffscreen,
}: {
  phase: HeroGamePhase;
  inViewport: boolean;
  documentVisible: boolean;
  pauseOffscreen: boolean;
}) {
  return phase === "active" && (!documentVisible || (pauseOffscreen && !inViewport));
}
