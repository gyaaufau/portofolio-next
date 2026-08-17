import { createInitialFishingState, reduceFishingState, type FishingState } from "../domain/state";
import type { FishingAssets } from "../rendering/assets";
import { drawFishingScene, LAKE_HEIGHT, LAKE_WIDTH } from "../rendering/renderer";

export interface FishingGameController {
  cast: () => void;
  press: () => void;
  release: () => void;
  moveStart: (direction: -1 | 1) => void;
  moveStop: () => void;
  interact: () => void;
  reset: () => void;
  setActive: (active: boolean) => void;
  setPaused: (paused: boolean) => void;
  destroy: () => void;
}

interface FishingRuntimeOptions {
  assets: FishingAssets;
  reducedMotion: boolean;
  onChange: (state: FishingState) => void;
  random?: () => number;
}

export function createFishingGame(canvas: HTMLCanvasElement, options: FishingRuntimeOptions): FishingGameController {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas 2D is not available");

  const random = options.random ?? Math.random;
  let state = createInitialFishingState();
  let active = false;
  let paused = false;
  let destroyed = false;
  let frame = 0;
  let previousTime = performance.now();
  let lastReported = -Infinity;

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.imageSmoothingEnabled = false;
    context.setTransform(width / LAKE_WIDTH, 0, 0, height / LAKE_HEIGHT, 0, 0);
  };

  const report = (force = false, time = performance.now()) => {
    if (force || time - lastReported >= 80) {
      lastReported = time;
      options.onChange(state);
    }
  };

  const render = (time: number) => {
    drawFishingScene(context, state, options.assets, time, options.reducedMotion);
  };

  const loop = (time: number) => {
    if (destroyed || paused) return;
    const deltaMs = Math.min(100, Math.max(0, time - previousTime));
    previousTime = time;
    if (active) {
      const previousActivity = state.activity;
      const previousX = state.location === "pier" ? state.playerX : state.boatX;
      state = reduceFishingState(state, { type: "tick", deltaMs, random: random() });
      const nextX = state.location === "pier" ? state.playerX : state.boatX;
      report(previousActivity !== state.activity || previousX !== nextX, time);
    }
    render(time);
    frame = window.requestAnimationFrame(loop);
  };

  const ensureLoop = () => {
    window.cancelAnimationFrame(frame);
    previousTime = performance.now();
    if (paused || destroyed) {
      render(previousTime);
      return;
    }
    frame = window.requestAnimationFrame(loop);
  };

  const dispatch = (next: FishingState) => {
    state = next;
    report(true);
    render(performance.now());
  };

  const observer = new ResizeObserver(() => {
    resize();
    render(performance.now());
  });
  observer.observe(canvas);
  resize();
  render(previousTime);
  ensureLoop();

  return {
    cast: () => dispatch(reduceFishingState(state, { type: "cast", random: random() })),
    press: () => dispatch(reduceFishingState(state, { type: "press" })),
    release: () => dispatch(reduceFishingState(state, { type: "release" })),
    moveStart: (direction) => dispatch(reduceFishingState(state, { type: "moveStart", direction })),
    moveStop: () => dispatch(reduceFishingState(state, { type: "moveStop" })),
    interact: () => dispatch(reduceFishingState(state, { type: "interact" })),
    reset: () => dispatch(reduceFishingState(state, { type: "reset" })),
    setActive: (nextActive) => {
      if (active === nextActive) return;
      active = nextActive;
      if (!active) state = reduceFishingState(state, { type: "reset" });
      report(true);
      ensureLoop();
    },
    setPaused: (nextPaused) => {
      if (paused === nextPaused) return;
      paused = nextPaused;
      if (paused) {
        state = reduceFishingState(reduceFishingState(state, { type: "release" }), { type: "moveStop" });
      }
      report(true);
      ensureLoop();
    },
    destroy: () => {
      destroyed = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    },
  };
}
