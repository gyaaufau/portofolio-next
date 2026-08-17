"use client";

import Image from "next/image";
import { Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { HeroGameAdapterProps } from "../core/types";
import { actionHint, createInitialFishingState, fishingStatus, type FishingState } from "./domain/state";
import { fishingKeyDownCommand, fishingKeyUpCommand, type FishingKeyCommand } from "./engine/input";
import { createFishingGame, type FishingGameController } from "./engine/runtime";
import { barrelSpriteForHaul, loadFishingAssets } from "./rendering/assets";
import "./pixel-fishing.css";

function DirectionButton({
  direction,
  label,
  onMove,
  onStop,
}: {
  direction: -1 | 1;
  label: string;
  onMove: (direction: -1 | 1) => void;
  onStop: () => void;
}) {
  const stop = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    onStop();
  };

  return (
    <button
      type="button"
      className="fishing-move-button"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onMove(direction);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={onStop}
    >
      {direction < 0 ? "←" : "→"}
    </button>
  );
}

function Meter({ label, value, tone }: { label: string; value: number; tone: "catch" | "tension" }) {
  return (
    <div className="fishing-meter" data-tone={tone}>
      <span>{label}</span>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function PixelFishingAdapter({ runtime, actions }: HeroGameAdapterProps) {
  const { registerActiveFocus, registerPreviewFocus, reportError, reportLoading, reportReady, requestExit, requestPlay, requestResume } = actions;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<FishingGameController | null>(null);
  const [game, setGame] = useState<FishingState>(createInitialFishingState);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    if (!runtime.nearViewport || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let disposed = false;
    setEngineReady(false);
    reportLoading();

    void loadFishingAssets()
      .then((assets) => {
        if (disposed) return;
        controllerRef.current = createFishingGame(canvas, {
          assets,
          reducedMotion: runtime.reducedMotion,
          onChange: setGame,
        });
        registerActiveFocus(stageRef.current);
        setEngineReady(true);
        reportReady();
      })
      .catch(reportError);

    return () => {
      disposed = true;
      registerActiveFocus(null);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [registerActiveFocus, reportError, reportLoading, reportReady, runtime.nearViewport, runtime.reducedMotion, runtime.retryKey]);

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
    const release = () => {
      controllerRef.current?.release();
      controllerRef.current?.moveStop();
    };
    window.addEventListener("blur", release);
    return () => window.removeEventListener("blur", release);
  }, [runtime.phase]);

  const exitFishing = useCallback(() => {
    controllerRef.current?.release();
    controllerRef.current?.moveStop();
    requestExit();
  }, [requestExit]);

  const hint = actionHint(game);

  const dispatchCommand = useCallback(
    (command: FishingKeyCommand) => {
      const controller = controllerRef.current;
      switch (command.type) {
        case "move":
          controller?.moveStart(command.direction);
          break;
        case "stopMoving":
          controller?.moveStop();
          break;
        case "action":
          if (hint === "board" || hint === "disembark") controller?.interact();
          else if (hint === "cast") controller?.cast();
          break;
        case "pressAction":
          controller?.press();
          break;
        case "releaseAction":
          controller?.release();
          break;
        case "exit":
          exitFishing();
          break;
      }
    },
    [hint, exitFishing],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (runtime.phase !== "active") return;
    if (event.key === "Escape") {
      event.preventDefault();
      exitFishing();
      return;
    }
    if (event.target !== event.currentTarget) return;
    const command = fishingKeyDownCommand(event.key, hint, event.repeat);
    if (!command) return;
    event.preventDefault();
    dispatchCommand(command);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (runtime.phase !== "active") return;
    if (event.target !== event.currentTarget) return;
    const command = fishingKeyUpCommand(event.key);
    if (!command) return;
    event.preventDefault();
    dispatchCommand(command);
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

  const performAction = () => {
    if (hint === "board" || hint === "disembark") controllerRef.current?.interact();
    else if (hint === "cast") controllerRef.current?.cast();
    stageRef.current?.focus({ preventScroll: true });
  };

  const active = runtime.phase === "revealing" || runtime.phase === "active" || runtime.phase === "exiting";
  const status = runtime.hostPaused ? "Fishing paused while the lake was out of view." : fishingStatus(game);
  const movementAvailable = game.activity === "idle" || game.activity === "walking" || game.activity === "rowing";
  const catchLabel =
    game.lastCatch?.size === "treasure" ? "Sunken treasure" : game.lastCatch?.size === "junk" ? "Lakeside litter" : "Gentle catch";

  return (
    <div
      ref={stageRef}
      className="fishing-stage"
      data-active={active}
      data-game-activity={game.activity}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) controllerRef.current?.moveStop();
      }}
      tabIndex={-1}
    >
      <canvas ref={canvasRef} className="fishing-canvas" width={480} height={270} aria-hidden="true" />
      <div className="fishing-texture" aria-hidden="true" />

      <div className="fishing-scrim" aria-hidden="true" />
      <div className="fishing-aperture-ring" aria-hidden="true" />
      <div className="fishing-transition-angler" aria-hidden="true" />

      {!active && (
        <div className="fishing-preview-ui">
          <div className="fishing-preview-label">
            <span className="fishing-eyebrow">Quiet Cast</span>
            <span>A quiet moment on the lake</span>
          </div>
          <button
            ref={registerPreviewFocus}
            type="button"
            className="fishing-play-button"
            onClick={requestPlay}
            disabled={!engineReady || runtime.phase === "loading"}
          >
            <Play aria-hidden="true" />
            {runtime.phase === "loading" || !engineReady ? "Waking the lake" : "Start fishing"}
          </button>
        </div>
      )}

      {runtime.phase === "active" && (
        <>
          <header className="fishing-hud">
            <div className="fishing-hud-status">
              <span className="fishing-eyebrow">Quiet Cast</span>
              <p className="fishing-status" aria-live="polite">{status}</p>
            </div>
            <div className="fishing-hud-side">
              <span className="fishing-haul" aria-label={`Haul: ${game.haul.length} catches this session`}>
                <Image src={barrelSpriteForHaul(game.haul.length)} alt="" width={22} height={25} unoptimized aria-hidden="true" />
                <i>×{game.haul.length}</i>
              </span>
              <button type="button" className="fishing-exit" onClick={exitFishing} aria-label="Exit fishing">
                <X aria-hidden="true" />
              </button>
            </div>
          </header>

          {(game.activity === "reeling" || (game.activity === "landed" && game.lastCatch)) && (
            <div className="fishing-panel">
              {game.activity === "reeling" && (
                <div className="fishing-meters">
                  <Meter label="Catch" value={game.progress} tone="catch" />
                  <Meter label="Tension" value={game.tension} tone="tension" />
                </div>
              )}
              {game.activity === "landed" && game.lastCatch && (
                <div className="fishing-catch-card">
                  <Image className="fishing-catch-sprite" src={game.lastCatch.sprite} alt="" width={108} height={24} unoptimized aria-hidden="true" />
                  <span>
                    <small>{catchLabel}</small>
                    {game.lastCatch.name}
                    <small>{game.lastCatch.flavor}</small>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="fishing-controls">
            {movementAvailable && (
              <div className="fishing-dpad" aria-label="Move">
                <DirectionButton direction={-1} label="Move left" onMove={(direction) => controllerRef.current?.moveStart(direction)} onStop={() => controllerRef.current?.moveStop()} />
                <DirectionButton direction={1} label="Move right" onMove={(direction) => controllerRef.current?.moveStart(direction)} onStop={() => controllerRef.current?.moveStop()} />
              </div>
            )}

            {runtime.hostPaused ? (
              <button type="button" className="fishing-action" onClick={requestResume}>Resume fishing</button>
            ) : hint === "board" || hint === "disembark" || hint === "cast" ? (
              <button type="button" className="fishing-action" onClick={performAction}>
                {hint === "board" ? "Board boat" : hint === "disembark" ? "Go ashore" : "Cast line"}
              </button>
            ) : hint === "hook" || hint === "reel" ? (
              <button
                type="button"
                className={`fishing-action${hint === "hook" ? " fishing-action-bite" : ""}`}
                onPointerDown={pressReel}
                onPointerUp={releaseReel}
                onPointerCancel={releaseReel}
                onLostPointerCapture={() => controllerRef.current?.release()}
              >
                {hint === "hook" ? "Hook now!" : "Hold to reel"}
              </button>
            ) : (
              <div className="fishing-waiting" aria-hidden="true">
                <i /><i /><i />
              </div>
            )}
          </div>

          <p className="fishing-help">Arrows or A/D to move · Space to act · Esc to leave</p>
        </>
      )}
    </div>
  );
}
