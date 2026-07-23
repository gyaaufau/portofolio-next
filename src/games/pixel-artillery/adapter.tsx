"use client";

import { Play, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { HeroGameAdapterProps } from "../core/types";
import { ARTILLERY_CONFIG } from "./data/config";
import { chooseEnemyShot, getEnemyThinkingDelay } from "./engine/ai";
import { ArtilleryInputState, type InputCommand } from "./engine/input";
import { artilleryReducer, createInitialMatch } from "./engine/machine";
import { createProjectile, ProjectileDriver } from "./engine/projectile";
import { calculateImpactDamage, canPlayerFire, chooseWind, createSeededRandom, getMuzzlePosition } from "./engine/rules";
import type { MatchState, Owner, ProjectileState, RandomSource } from "./engine/types";
import { renderArtilleryFrame } from "./rendering/renderer";
import "./pixel-artillery.css";

function windLabel(wind: number) {
  if (wind === 0) return "Wind still";
  return `Wind ${wind < 0 ? "←" : "→"} ${Math.abs(wind).toFixed(1)}`;
}

export default function PixelArtilleryAdapter({ runtime, actions }: HeroGameAdapterProps) {
  const {
    registerActiveFocus,
    registerPreviewFocus,
    reportLoading,
    reportReady,
    requestExit,
    requestPlay,
    requestResume,
  } = actions;
  const [random] = useState<RandomSource>(() => createSeededRandom(0x51a7c011));
  const [state, dispatch] = useReducer(
    artilleryReducer,
    undefined,
    () => createInitialMatch(0.2),
  );
  const stateRef = useRef<MatchState>(state);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const projectileRef = useRef<ProjectileState | null>(null);
  const driverRef = useRef<ProjectileDriver | null>(null);
  const inputRef = useRef(new ArtilleryInputState());
  const previousHostPhaseRef = useRef(runtime.phase);
  const effectStartedAtRef = useRef<number | null>(null);
  const effectFrameRef = useRef<number | null>(null);
  const compactRef = useRef(false);
  const reducedMotionRef = useRef(runtime.reducedMotion);
  const resolutionTimerRef = useRef<number | null>(null);

  const paused = runtime.hostPaused || !runtime.documentVisible || runtime.phase !== "active";

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    reducedMotionRef.current = runtime.reducedMotion;
  }, [runtime.reducedMotion]);

  const renderCurrent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderArtilleryFrame(canvas, {
      state: stateRef.current,
      projectile: projectileRef.current,
      reducedMotion: reducedMotionRef.current,
      compact: compactRef.current,
      effectStartedAt: effectStartedAtRef.current,
      now: performance.now(),
    });
  }, []);

  const clearResolutionWork = useCallback(() => {
    if (resolutionTimerRef.current !== null) window.clearTimeout(resolutionTimerRef.current);
    if (effectFrameRef.current !== null) window.cancelAnimationFrame(effectFrameRef.current);
    resolutionTimerRef.current = null;
    effectFrameRef.current = null;
  }, []);

  useEffect(() => {
    reportLoading();
  }, [reportLoading]);

  useEffect(() => {
    if (!runtime.nearViewport || !canvasRef.current) return;
    const driver = new ProjectileDriver(
      {
        requestFrame: (callback) => window.requestAnimationFrame(callback),
        cancelFrame: (id) => window.cancelAnimationFrame(id),
      },
      () => stateRef.current,
      (projectile) => {
        projectileRef.current = projectile.hasResolved ? null : projectile;
        renderCurrent();
      },
      (impact, projectile) => {
        if (projectile.hasResolved) {
          const current = stateRef.current;
          const damage = calculateImpactDamage(impact, current);
          effectStartedAtRef.current = performance.now();
          dispatch({ type: "IMPACT", owner: projectile.owner, impact, damage });
        }
      },
    );
    driverRef.current = driver;
    reportReady();
    renderCurrent();
    return () => {
      driver.dispose();
      if (driverRef.current === driver) driverRef.current = null;
      projectileRef.current = null;
    };
  }, [renderCurrent, reportReady, runtime.nearViewport, runtime.retryKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      compactRef.current = canvas.getBoundingClientRect().width < 560;
      renderCurrent();
    };
    updateSize();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [renderCurrent]);

  useEffect(() => {
    renderCurrent();
  }, [renderCurrent, state, runtime.reducedMotion]);

  useEffect(() => {
    driverRef.current?.setPaused(paused);
    if (paused) inputRef.current.clear();
  }, [paused]);

  useEffect(() => {
    const previous = previousHostPhaseRef.current;
    if (runtime.phase === "active" && previous === "revealing") dispatch({ type: "START" });
    if (runtime.phase === "preview" && previous === "exiting") {
      driverRef.current?.cancel();
      projectileRef.current = null;
      clearResolutionWork();
      effectStartedAtRef.current = null;
      dispatch({ type: "RETURN_TO_READY", wind: chooseWind(random) });
    }
    previousHostPhaseRef.current = runtime.phase;
  }, [clearResolutionWork, random, runtime.phase]);

  useEffect(() => {
    const owner = state.phase === "resolvingPlayerHit"
      ? "player"
      : state.phase === "resolvingEnemyHit"
        ? "enemy"
        : null;
    if (!owner || paused) return;
    clearResolutionWork();
    effectStartedAtRef.current = performance.now();
    if (!runtime.reducedMotion) {
      const animateEffect = () => {
        renderCurrent();
        effectFrameRef.current = window.requestAnimationFrame(animateEffect);
      };
      effectFrameRef.current = window.requestAnimationFrame(animateEffect);
    }
    const delay = runtime.reducedMotion
      ? ARTILLERY_CONFIG.reducedImpactResolutionMs
      : ARTILLERY_CONFIG.impactResolutionMs;
    resolutionTimerRef.current = window.setTimeout(() => {
      clearResolutionWork();
      effectStartedAtRef.current = null;
      dispatch({ type: "RESOLVE_IMPACT", owner, nextWind: chooseWind(random) });
    }, delay);
    return clearResolutionWork;
  }, [clearResolutionWork, paused, random, renderCurrent, runtime.reducedMotion, state.phase]);

  const fireShot = useCallback((owner: Owner, angle: number, power: number) => {
    const current = stateRef.current;
    const valid = owner === "player"
      ? canPlayerFire(current)
      : current.phase === "enemyThinking" && current.turn === "enemy";
    if (!valid || driverRef.current?.isRunning()) return;
    const projectile = createProjectile(owner, getMuzzlePosition(owner, current), angle, power);
    dispatch({ type: "FIRE", owner });
    projectileRef.current = projectile;
    driverRef.current?.start(projectile);
  }, []);

  useEffect(() => {
    if (state.phase !== "enemyThinking" || paused || state.enemyAim) return;
    const aim = chooseEnemyShot(state, random);
    dispatch({ type: "AI_AIM", aim });
  }, [paused, random, state]);

  useEffect(() => {
    if (state.phase !== "enemyThinking" || paused || !state.enemyAim) return;
    const aim = state.enemyAim;
    const delay = getEnemyThinkingDelay(random);
    const timer = window.setTimeout(() => fireShot("enemy", aim.angle, aim.power), delay);
    return () => window.clearTimeout(timer);
  }, [fireShot, paused, random, state.enemyAim, state.phase]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) inputRef.current.clear();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => () => {
    clearResolutionWork();
    driverRef.current?.dispose();
    inputRef.current.blur();
  }, [clearResolutionWork]);

  const adjustAngle = (delta: number) => dispatch({ type: "ADJUST_ANGLE", delta });
  const adjustPower = (delta: number) => dispatch({ type: "ADJUST_POWER", delta });
  const restart = () => {
    clearResolutionWork();
    driverRef.current?.cancel();
    projectileRef.current = null;
    effectStartedAtRef.current = null;
    dispatch({ type: "RESTART", wind: chooseWind(random) });
    surfaceRef.current?.focus({ preventScroll: true });
  };

  const runCommand = (command: InputCommand) => {
    if (command === "angleUp") adjustAngle(ARTILLERY_CONFIG.angleStep);
    if (command === "angleDown") adjustAngle(-ARTILLERY_CONFIG.angleStep);
    if (command === "powerDown") adjustPower(-ARTILLERY_CONFIG.powerStep);
    if (command === "powerUp") adjustPower(ARTILLERY_CONFIG.powerStep);
    if (command === "fire") fireShot("player", stateRef.current.aimAngle, stateRef.current.shotPower);
    if (command === "restart") restart();
    if (command === "exit") requestExit();
  };

  const setSurface = useCallback((element: HTMLDivElement | null) => {
    surfaceRef.current = element;
    registerActiveFocus(element);
  }, [registerActiveFocus]);

  const setPreviewButton = useCallback((element: HTMLButtonElement | null) => {
    registerPreviewFocus(element);
  }, [registerPreviewFocus]);

  const isImmersive = runtime.phase === "revealing" || runtime.phase === "active" || runtime.phase === "exiting";
  const controlsEnabled = runtime.phase === "active" && state.phase === "playerAiming" && !paused;
  const result = state.phase === "playerWon" || state.phase === "playerLost";
  const activeUi = runtime.phase === "revealing" || runtime.phase === "active";

  return (
    <div
      ref={setSurface}
      className={`artillery-stage${state.isFocused ? " is-focused" : ""}`}
      tabIndex={-1}
      onPointerDown={() => {
        if (runtime.phase === "active") surfaceRef.current?.focus({ preventScroll: true });
      }}
      onFocus={() => {
        inputRef.current.focus();
        dispatch({ type: "FOCUS" });
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        inputRef.current.blur();
        dispatch({ type: "BLUR" });
      }}
      onKeyDown={(event) => {
        const command = inputRef.current.keyDown(event.key, stateRef.current.phase);
        if (!command) return;
        event.preventDefault();
        if (!event.repeat || command !== "fire") runCommand(command);
      }}
      onKeyUp={(event) => inputRef.current.keyUp(event.key)}
    >
      <canvas ref={canvasRef} className="artillery-canvas" aria-hidden="true" />

      {!isImmersive && (
        <div className="artillery-preview-ui">
          <div className="artillery-preview-label">
            <span className="text-pixel">ANT WARFARE</span>
            <span>A tiny dispute with excellent ballistics.</span>
          </div>
          <button ref={setPreviewButton} type="button" className="artillery-start" onClick={requestPlay}>
            <Play className="size-4 fill-current" aria-hidden="true" /> Start duel
          </button>
        </div>
      )}

      {activeUi && (
        <>
          <div className="artillery-hud">
            <div className="artillery-health">
              <span>You</span><strong>{state.player.health} HP</strong>
              <i><b style={{ width: `${state.player.health}%` }} /></i>
            </div>
            <div className="artillery-status">
              <span>{state.turn === "player" ? "Your turn" : state.turn === "enemy" ? "Enemy turn" : "Impact"}</span>
              <small>{windLabel(state.wind)}</small>
            </div>
            <div className="artillery-health is-enemy">
              <span>Enemy</span><strong>{state.enemy.health} HP</strong>
              <i><b style={{ width: `${state.enemy.health}%` }} /></i>
            </div>
          </div>

          <div className="artillery-utility">
            <button type="button" onClick={requestExit} aria-label="Exit Tiny Artillery"><X aria-hidden="true" /></button>
          </div>

          <div className="artillery-readout" aria-hidden={!controlsEnabled}>
            <span>Angle <b>{state.aimAngle}°</b></span>
            <span>Power <b>{state.shotPower}%</b></span>
          </div>

          <div className="artillery-instruction">
            {controlsEnabled ? "Adjust angle and power, then fire." : state.announcement}
          </div>

          <div className="artillery-controls" aria-label="Tiny Artillery controls">
            <div>
              <button type="button" disabled={!controlsEnabled} onClick={() => adjustAngle(-ARTILLERY_CONFIG.angleStep)} aria-label="Decrease firing angle">Angle −</button>
              <button type="button" disabled={!controlsEnabled} onClick={() => adjustAngle(ARTILLERY_CONFIG.angleStep)} aria-label="Increase firing angle">Angle +</button>
            </div>
            <div>
              <button type="button" disabled={!controlsEnabled} onClick={() => adjustPower(-ARTILLERY_CONFIG.powerStep)} aria-label="Decrease shot power">Power −</button>
              <button type="button" disabled={!controlsEnabled} onClick={() => adjustPower(ARTILLERY_CONFIG.powerStep)} aria-label="Increase shot power">Power +</button>
            </div>
            <button
              type="button"
              className="artillery-fire"
              disabled={!controlsEnabled}
              onClick={() => fireShot("player", state.aimAngle, state.shotPower)}
            >
              FIRE
            </button>
          </div>

          <div className="artillery-keyboard-hint">Arrows or WASD adjust · Space fires · Escape exits</div>
        </>
      )}

      {runtime.hostPaused && runtime.phase === "active" && (
        <div className="artillery-overlay">
          <span className="text-pixel">DUEL PAUSED</span>
          <button type="button" className="pixel-button bg-primary text-primary-foreground" onClick={requestResume}>Resume</button>
        </div>
      )}

      {result && runtime.phase === "active" && (
        <div className="artillery-overlay artillery-result">
          <span className="text-pixel">{state.phase === "playerWon" ? "VICTORY" : "DEFEAT"}</span>
          <p>{state.phase === "playerWon" ? "The colony is safe." : "The ant will recover."}</p>
          <div>
            <button type="button" className="pixel-button bg-primary text-primary-foreground" onClick={restart}>
              <RotateCcw className="size-4" aria-hidden="true" /> Play again
            </button>
            <button type="button" className="pixel-button bg-card text-foreground" onClick={requestExit}>Exit</button>
          </div>
        </div>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">{state.announcement}</div>
    </div>
  );
}
