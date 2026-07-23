"use client";

import { Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { HeroGameAdapterProps } from "../core/types";
import { createInitialFishingState, fishingStatus, type FishingState } from "./domain/state";
import { createFishingGame, type FishingGameController } from "./engine/runtime";
import styles from "./pixel-fishing.module.css";

export default function PixelFishingAdapter({ runtime, actions }: HeroGameAdapterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<FishingGameController | null>(null);
  const [game, setGame] = useState<FishingState>(createInitialFishingState);

  const setPreviewFocus = useCallback((element: HTMLButtonElement | null) => {
    actions.registerPreviewFocus(element);
  }, [actions]);

  useEffect(() => {
    if (!runtime.nearViewport || !canvasRef.current) return;
    actions.reportLoading();
    try {
      const controller = createFishingGame(canvasRef.current, {
        reducedMotion: runtime.reducedMotion,
        onChange: setGame,
      });
      controllerRef.current = controller;
      actions.registerActiveFocus(surfaceRef.current);
      actions.reportReady();
      return () => {
        actions.registerActiveFocus(null);
        controller.destroy();
        controllerRef.current = null;
      };
    } catch (error) {
      actions.reportError(error);
    }
  }, [actions, runtime.nearViewport, runtime.reducedMotion, runtime.retryKey]);

  useEffect(() => {
    controllerRef.current?.setActive(runtime.phase === "active");
  }, [runtime.phase]);

  useEffect(() => {
    const pausePreviewForReducedMotion = runtime.reducedMotion && runtime.phase !== "active";
    controllerRef.current?.setPaused(
      !runtime.inViewport || !runtime.documentVisible || runtime.hostPaused || pausePreviewForReducedMotion,
    );
  }, [runtime.documentVisible, runtime.hostPaused, runtime.inViewport, runtime.phase, runtime.reducedMotion]);

  useEffect(() => {
    if (runtime.phase !== "active") return;
    const release = () => controllerRef.current?.release();
    window.addEventListener("blur", release);
    return () => window.removeEventListener("blur", release);
  }, [runtime.phase]);

  const startFishing = () => actions.requestPlay();
  const exitFishing = () => {
    controllerRef.current?.release();
    actions.requestExit();
  };

  const pressReel = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    controllerRef.current?.press();
  };

  const releaseReel = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    controllerRef.current?.release();
  };

  const keyDownReel = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      controllerRef.current?.press();
    }
  };

  const keyUpReel = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      controllerRef.current?.release();
    }
  };

  const surfaceKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && runtime.phase === "active") {
      event.preventDefault();
      exitFishing();
    }
  };

  const active = runtime.phase === "revealing" || runtime.phase === "active" || runtime.phase === "exiting";
  const status = runtime.hostPaused ? "Fishing paused while the lake was out of view." : fishingStatus(game);
  const actionLabel = game.phase === "fishBiting" ? "Hook the fish" : "Hold to reel";

  return (
    <div
      ref={surfaceRef}
      className={styles.stage}
      data-active={active}
      data-game-phase={game.phase}
      onKeyDown={surfaceKeyDown}
      tabIndex={-1}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.texture} aria-hidden="true" />

      {!active && (
        <div className={styles.previewControls}>
          <span className={styles.eyebrow}>A quiet moment</span>
          <button
            ref={setPreviewFocus}
            type="button"
            className={styles.startButton}
            onClick={startFishing}
            disabled={runtime.phase === "loading"}
          >
            <Play aria-hidden="true" />
            {runtime.phase === "loading" ? "Waking the lake" : "Start fishing"}
          </button>
        </div>
      )}

      {runtime.phase === "active" && (
        <div className={styles.gamePanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Quiet Cast</span>
              <p className={styles.status} aria-live="polite">{status}</p>
            </div>
            <button type="button" className={styles.exitButton} onClick={exitFishing} aria-label="Exit fishing">
              <X aria-hidden="true" />
            </button>
          </div>

          {game.phase === "reeling" && (
            <div className={styles.meters}>
              <Meter label="Catch" value={game.progress} tone="catch" />
              <Meter label="Tension" value={game.tension} tone="tension" />
            </div>
          )}

          {game.phase === "caught" && game.fish && (
            <div
              className={styles.catchCard}
              style={{ "--fish-color": game.fish.color, "--fish-accent": game.fish.accent } as CSSProperties}
            >
              <span className={styles.fishIcon} aria-hidden="true"><i /></span>
              <span><small>Gentle catch</small>{game.fish.name}</span>
            </div>
          )}

          {runtime.hostPaused ? (
            <button type="button" className={styles.actionButton} onClick={actions.requestResume}>Resume fishing</button>
          ) : game.phase === "idle" ? (
            <button type="button" className={styles.actionButton} onClick={() => controllerRef.current?.cast()}>Cast line</button>
          ) : game.phase === "fishBiting" || game.phase === "reeling" ? (
            <button
              type="button"
              className={`${styles.actionButton} ${game.phase === "fishBiting" ? styles.biteButton : ""}`}
              onPointerDown={pressReel}
              onPointerUp={releaseReel}
              onPointerCancel={releaseReel}
              onLostPointerCapture={() => controllerRef.current?.release()}
              onKeyDown={keyDownReel}
              onKeyUp={keyUpReel}
            >
              {actionLabel}
            </button>
          ) : (
            <div className={styles.waiting} aria-hidden="true">
              <i /><i /><i />
            </div>
          )}

          <p className={styles.help}>Use the button or Space. Release to ease tension. Esc exits.</p>
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, tone }: { label: string; value: number; tone: "catch" | "tension" }) {
  return (
    <div className={styles.meter} data-tone={tone}>
      <span>{label}</span>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
