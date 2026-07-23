import { createInitialFishingState, reduceFishingState, type FishingState } from "../domain/state";

const LOGICAL_WIDTH = 320;
const LOGICAL_HEIGHT = 180;

export interface FishingGameController {
  cast: () => void;
  press: () => void;
  release: () => void;
  reset: () => void;
  setActive: (active: boolean) => void;
  setPaused: (paused: boolean) => void;
  destroy: () => void;
}

interface FishingRuntimeOptions {
  reducedMotion: boolean;
  onChange: (state: FishingState) => void;
  random?: () => number;
}

function drawPixelFish(context: CanvasRenderingContext2D, x: number, y: number, direction: 1 | -1, color: string, accent: string) {
  context.save();
  context.translate(x, y);
  context.scale(direction, 1);
  context.fillStyle = color;
  context.fillRect(-6, -2, 10, 5);
  context.fillRect(-3, -4, 5, 9);
  context.fillRect(4, -1, 3, 3);
  context.fillRect(-10, -3, 4, 2);
  context.fillRect(-10, 2, 4, 2);
  context.fillStyle = accent;
  context.fillRect(-1, -3, 2, 2);
  context.fillStyle = "#132b2a";
  context.fillRect(4, -1, 1, 1);
  context.restore();
}

function drawScene(context: CanvasRenderingContext2D, state: FishingState, timeMs: number, reducedMotion: boolean) {
  const time = reducedMotion ? 0 : timeMs;
  context.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  const sky = ["#8ca4a0", "#91aaa3", "#9db3aa", "#adbbb0", "#c4c6b2"];
  sky.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(0, index * 18, LOGICAL_WIDTH, 18);
  });
  context.fillStyle = "#e5be81";
  context.fillRect(254, 24, 14, 14);
  context.fillStyle = "#efd6a4";
  context.fillRect(257, 21, 8, 20);
  context.fillRect(251, 27, 20, 8);

  context.fillStyle = "#647f75";
  context.beginPath();
  context.moveTo(0, 78); context.lineTo(36, 52); context.lineTo(68, 72); context.lineTo(112, 43); context.lineTo(151, 77); context.lineTo(188, 54); context.lineTo(230, 78); context.lineTo(320, 62); context.lineTo(320, 102); context.lineTo(0, 102); context.closePath();
  context.fill();
  context.fillStyle = "#506d66";
  context.beginPath();
  context.moveTo(0, 88); context.lineTo(50, 66); context.lineTo(94, 86); context.lineTo(144, 61); context.lineTo(202, 86); context.lineTo(254, 68); context.lineTo(320, 85); context.lineTo(320, 105); context.lineTo(0, 105); context.closePath();
  context.fill();

  context.fillStyle = "rgba(222, 226, 207, 0.35)";
  const mistOffset = Math.floor((time / 240) % 18);
  context.fillRect(-18 + mistOffset, 83, 112, 3);
  context.fillRect(104 - mistOffset, 91, 142, 2);
  context.fillRect(238 + mistOffset / 2, 78, 72, 2);

  const water = ["#527d7a", "#4c7473", "#456c6d", "#3e6467", "#385c61"];
  water.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(0, 94 + index * 18, LOGICAL_WIDTH, 18);
  });
  context.fillStyle = "rgba(232, 214, 166, 0.38)";
  context.fillRect(244, 99, 35, 1);
  context.fillRect(250, 106, 24, 1);
  context.fillRect(257, 114, 13, 1);

  context.fillStyle = "rgba(199, 224, 211, 0.34)";
  for (let index = 0; index < 7; index += 1) {
    const drift = Math.floor((time / (180 + index * 17)) % 24);
    context.fillRect((index * 51 + drift) % 340 - 10, 108 + index * 9, 16 + (index % 3) * 7, 1);
  }

  context.fillStyle = "#263f3c";
  context.fillRect(272, 108, 48, 5);
  context.fillRect(280, 113, 4, 22);
  context.fillRect(307, 113, 4, 22);
  context.fillStyle = "#c7a276";
  context.fillRect(288, 76, 8, 15);
  context.fillStyle = "#273d38";
  context.fillRect(286, 71, 12, 6);
  context.fillRect(284, 76, 4, 10);
  context.fillStyle = "#596d5a";
  context.fillRect(285, 90, 12, 14);
  context.fillStyle = "#333d35";
  context.fillRect(291, 104, 5, 8);
  context.fillRect(298, 103, 12, 3);
  context.fillStyle = "#7f654a";
  context.save();
  context.translate(297, 91);
  context.rotate(-0.44);
  context.fillRect(0, 0, 2, 44);
  context.restore();

  const castProgress = state.phase === "casting" ? Math.min(1, state.elapsedMs / 600) : 1;
  const bobberX = state.phase === "idle" || state.phase === "caught" ? 300 : 292 - 105 * castProgress;
  const castArc = state.phase === "casting" ? Math.sin(castProgress * Math.PI) * 34 : 0;
  const bobberY = 112 - castArc + (state.phase === "fishBiting" ? Math.floor(time / 90) % 2 * 3 : 0);
  if (state.phase !== "idle" && state.phase !== "caught") {
    context.strokeStyle = "#d8d8c3";
    context.lineWidth = 0.75;
    context.beginPath();
    context.moveTo(312, 95);
    context.quadraticCurveTo(264, 72 - castArc, bobberX, bobberY);
    context.stroke();
    context.fillStyle = "#e1ddd0";
    context.fillRect(Math.floor(bobberX) - 1, Math.floor(bobberY) - 3, 3, 3);
    context.fillStyle = state.phase === "fishBiting" ? "#e0a06a" : "#c66e5b";
    context.fillRect(Math.floor(bobberX) - 1, Math.floor(bobberY), 3, 3);
  }

  if (state.phase === "fishBiting" || state.phase === "reeling") {
    const fishX = state.phase === "reeling" ? 184 + state.progress * 0.7 : 168 + Math.sin(time / 180) * 9;
    drawPixelFish(context, fishX, 130 + Math.sin(time / 160) * 3, 1, "#274f51", "#8aac8e");
  }
  if (state.phase === "caught" && state.fish) {
    drawPixelFish(context, 235, 82, -1, state.fish.color, state.fish.accent);
  }

  context.fillStyle = "#354f43";
  for (const x of [8, 14, 21, 42, 49, 315]) {
    const sway = reducedMotion ? 0 : Math.round(Math.sin(time / 700 + x) * 1);
    context.fillRect(x, 139, 2, 35);
    context.fillRect(x + sway, 136 + (x % 7), 2, 12);
  }

  const vignette = context.createLinearGradient(0, 0, LOGICAL_WIDTH, 0);
  vignette.addColorStop(0, "rgba(8, 23, 22, 0.66)");
  vignette.addColorStop(0.5, "rgba(8, 23, 22, 0.08)");
  vignette.addColorStop(1, "rgba(8, 23, 22, 0.04)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
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
    context.setTransform(width / LOGICAL_WIDTH, 0, 0, height / LOGICAL_HEIGHT, 0, 0);
  };

  const report = (force = false, time = performance.now()) => {
    if (force || time - lastReported >= 80) {
      lastReported = time;
      options.onChange(state);
    }
  };

  const render = (time: number) => {
    drawScene(context, state, time, options.reducedMotion);
  };

  const loop = (time: number) => {
    if (destroyed || paused) return;
    const deltaMs = Math.min(100, Math.max(0, time - previousTime));
    previousTime = time;
    if (active) {
      const previousPhase = state.phase;
      state = reduceFishingState(state, { type: "tick", deltaMs, random: random() });
      report(previousPhase !== state.phase, time);
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
      if (paused) state = reduceFishingState(state, { type: "release" });
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
