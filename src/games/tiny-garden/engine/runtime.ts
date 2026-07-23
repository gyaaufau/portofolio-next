import { createInitialTinyGardenState, createTinyGardenSnapshot, reduceTinyGardenState } from "../domain/reducer";
import type { MoveIntent, SeedId, TinyGardenSnapshot, TinyGardenState } from "../domain/types";

export interface TinyGardenScheduler {
  now: () => number;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (frame: number) => void;
}

export interface TinyGardenController {
  selectSeed: (seedId: SeedId) => void;
  cycleSeed: (direction: -1 | 1) => void;
  confirmSeed: () => void;
  move: (direction: Exclude<MoveIntent, 0>) => void;
  stopMoving: () => void;
  action: () => void;
  restart: () => void;
  reset: () => void;
  setInteractive: (interactive: boolean) => void;
  setPaused: (paused: boolean) => void;
  getState: () => TinyGardenState;
  destroy: () => void;
}

interface TinyGardenRuntimeOptions {
  reducedMotion: boolean;
  render: (state: TinyGardenState, timeMs: number, reducedMotion: boolean) => void;
  onChange: (snapshot: TinyGardenSnapshot) => void;
  random?: () => number;
  scheduler?: TinyGardenScheduler;
}

function browserScheduler(): TinyGardenScheduler {
  return {
    now: () => performance.now(),
    requestFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (frame) => window.cancelAnimationFrame(frame),
  };
}

export function createTinyGardenRuntime(options: TinyGardenRuntimeOptions): TinyGardenController {
  const scheduler = options.scheduler ?? browserScheduler();
  const random = options.random ?? Math.random;
  let state = createInitialTinyGardenState();
  let interactive = false;
  let paused = false;
  let destroyed = false;
  let frame = 0;
  let previousTime = scheduler.now();
  let previousSnapshotKey = "";

  const report = (force = false) => {
    const snapshot = createTinyGardenSnapshot(state);
    const key = JSON.stringify(snapshot);
    if (force || key !== previousSnapshotKey) {
      previousSnapshotKey = key;
      options.onChange(snapshot);
    }
  };

  const dispatch = (event: Parameters<typeof reduceTinyGardenState>[1], forceReport = false) => {
    const previous = state;
    state = reduceTinyGardenState(state, event);
    if (forceReport || previous !== state) report();
  };

  const draw = (time: number) => options.render(state, time, options.reducedMotion);

  const loop = (time: number) => {
    if (destroyed || paused) return;
    const deltaMs = Math.min(100, Math.max(0, time - previousTime));
    previousTime = time;
    if (interactive) dispatch({ type: "tick", deltaMs, random: random() });
    draw(time);
    frame = scheduler.requestFrame(loop);
  };

  const ensureLoop = () => {
    scheduler.cancelFrame(frame);
    previousTime = scheduler.now();
    if (destroyed || paused) {
      draw(previousTime);
      return;
    }
    frame = scheduler.requestFrame(loop);
  };

  draw(previousTime);
  report(true);
  ensureLoop();

  return {
    selectSeed: (seedId) => dispatch({ type: "selectSeed", seedId }),
    cycleSeed: (direction) => dispatch({ type: "cycleSeed", direction }),
    confirmSeed: () => dispatch({ type: "confirmSeed" }),
    move: (direction) => interactive && dispatch({ type: "move", direction }),
    stopMoving: () => dispatch({ type: "stopMoving" }),
    action: () => interactive && dispatch({ type: "action" }),
    restart: () => interactive && dispatch({ type: "restart", random: random() }, true),
    reset: () => dispatch({ type: "deactivate" }, true),
    setInteractive: (nextInteractive) => {
      if (interactive === nextInteractive) return;
      interactive = nextInteractive;
      dispatch(nextInteractive ? { type: "activate", random: random() } : { type: "deactivate" }, true);
    },
    setPaused: (nextPaused) => {
      if (paused === nextPaused) return;
      paused = nextPaused;
      if (paused) dispatch({ type: "stopMoving" });
      ensureLoop();
    },
    getState: () => state,
    destroy: () => {
      destroyed = true;
      interactive = false;
      dispatch({ type: "stopMoving" });
      scheduler.cancelFrame(frame);
    },
  };
}
