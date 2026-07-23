"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import type { HeroGameAdapterProps } from "../core/types";
import { createInitialTinyGardenState, createTinyGardenSnapshot } from "./domain/reducer";
import { SEEDS } from "./domain/seeds";
import type { SeedId, TinyGardenSnapshot } from "./domain/types";
import { gardenKeyDownCommand, gardenKeyUpCommand, type GardenKeyCommand } from "./engine/input";
import { createTinyGardenRuntime, type TinyGardenController } from "./engine/runtime";
import { createTinyGardenRenderer, loadTinyGardenAssets } from "./rendering/renderer";
import "./tiny-garden.css";

const INITIAL_SNAPSHOT = createTinyGardenSnapshot(createInitialTinyGardenState());

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
  const stop = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    onStop();
  };

  return (
    <button
      type="button"
      className="tiny-garden-direction"
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

export default function TinyGardenAdapter({ runtime, actions }: HeroGameAdapterProps) {
  const {
    registerActiveFocus,
    registerPreviewFocus,
    reportError,
    reportLoading,
    reportReady,
    requestExit,
    requestPlay,
  } = actions;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<TinyGardenController | null>(null);
  const [snapshot, setSnapshot] = useState<TinyGardenSnapshot>(INITIAL_SNAPSHOT);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    if (!runtime.nearViewport || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let disposed = false;
    setEngineReady(false);
    reportLoading();

    void loadTinyGardenAssets()
      .then((assets) => {
        if (disposed) return;
        const renderer = createTinyGardenRenderer(canvas, assets);
        controllerRef.current = createTinyGardenRuntime({
          reducedMotion: runtime.reducedMotion,
          render: renderer,
          onChange: setSnapshot,
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
    controllerRef.current?.setInteractive(runtime.phase === "active");
  }, [runtime.phase]);

  useEffect(() => {
    controllerRef.current?.setPaused(runtime.hostPaused || !runtime.inViewport || !runtime.documentVisible);
  }, [runtime.documentVisible, runtime.hostPaused, runtime.inViewport]);

  const dispatchCommand = useCallback((command: GardenKeyCommand) => {
    const controller = controllerRef.current;
    if (!controller) return;
    switch (command.type) {
      case "cycleSeed": controller.cycleSeed(command.direction); break;
      case "move": controller.move(command.direction); break;
      case "stopMoving": controller.stopMoving(); break;
      case "confirmSeed": controller.confirmSeed(); break;
      case "action": controller.action(); break;
      case "restart": controller.restart(); break;
      case "exit":
        controller.reset();
        requestExit();
        break;
    }
  }, [requestExit]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (runtime.phase !== "active") return;
    const command = gardenKeyDownCommand(event.key, snapshot.phase, event.repeat);
    if (!command) return;
    event.preventDefault();
    event.stopPropagation();
    dispatchCommand(command);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (runtime.phase !== "active") return;
    const command = gardenKeyUpCommand(event.key, snapshot.phase);
    if (!command) return;
    event.preventDefault();
    dispatchCommand(command);
  };

  const selectSeed = (seedId: SeedId) => controllerRef.current?.selectSeed(seedId);
  const performAction = () => {
    if (snapshot.phase === "seedSelection") controllerRef.current?.confirmSeed();
    else if (snapshot.phase === "bloomed") controllerRef.current?.restart();
    else controllerRef.current?.action();
    stageRef.current?.focus({ preventScroll: true });
  };

  const movementAvailable = snapshot.phase === "carryingSeed" || snapshot.phase === "planted";
  const actionDisabled = useMemo(() => {
    if (snapshot.phase === "carryingSeed" || snapshot.phase === "planted") return !snapshot.isNearSoil;
    return snapshot.phase !== "seedSelection" && snapshot.phase !== "bloomed";
  }, [snapshot.isNearSoil, snapshot.phase]);

  return (
    <div className="tiny-garden-layer">
      <div
        ref={stageRef}
        className="tiny-garden-stage"
        data-ready={engineReady}
        data-interactive={runtime.phase === "active"}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) controllerRef.current?.stopMoving();
        }}
      >
        <canvas ref={canvasRef} className="tiny-garden-canvas" width={320} height={180} aria-hidden="true" />
        <div className="tiny-garden-shade" aria-hidden="true" />

        {runtime.phase === "preview" && (
          <button
            ref={registerPreviewFocus}
            type="button"
            className="tiny-garden-start"
            disabled={!engineReady}
            onClick={requestPlay}
          >
            <span>TOUCH GRASS</span>
            {engineReady ? "Choose a seed" : "Growing the garden"}
          </button>
        )}

        {runtime.phase === "active" && (
          <>
            <div className="tiny-garden-status" aria-hidden="true">
              <span>{snapshot.status}</span>
              {(snapshot.phase === "planted" || snapshot.phase === "watering" || snapshot.phase === "growing") && (
                <small>Water {snapshot.wateringCount}/3</small>
              )}
            </div>

            {snapshot.phase === "seedSelection" && (
              <div className="tiny-garden-seeds" aria-label="Choose a seed">
                {SEEDS.map((seed) => (
                  <button
                    key={seed.id}
                    type="button"
                    data-selected={snapshot.selectedSeedId === seed.id}
                    aria-pressed={snapshot.selectedSeedId === seed.id}
                    onClick={() => selectSeed(seed.id)}
                    style={{ "--seed-accent": seed.accent } as React.CSSProperties}
                  >
                    <i aria-hidden="true" />
                    {seed.shortName}
                  </button>
                ))}
              </div>
            )}

            <div className="tiny-garden-controls" aria-label="Tiny Garden controls">
              {movementAvailable && (
                <div className="tiny-garden-movement">
                  <DirectionButton direction={-1} label="Move left" onMove={(direction) => controllerRef.current?.move(direction)} onStop={() => controllerRef.current?.stopMoving()} />
                  <DirectionButton direction={1} label="Move right" onMove={(direction) => controllerRef.current?.move(direction)} onStop={() => controllerRef.current?.stopMoving()} />
                </div>
              )}
              <button type="button" className="tiny-garden-action" disabled={actionDisabled} onClick={performAction}>
                {snapshot.actionLabel}
              </button>
              <button type="button" className="tiny-garden-exit" onClick={() => dispatchCommand({ type: "exit" })}>
                Leave
              </button>
            </div>
          </>
        )}

        <p className="sr-only" aria-live="polite" aria-atomic="true">{snapshot.status}</p>
      </div>
    </div>
  );
}
