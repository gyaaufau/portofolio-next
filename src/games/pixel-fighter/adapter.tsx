"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroGameAdapterProps } from "../core/types";
import { CHARACTERS, CHARACTER_IDS, parseCharacterSelection } from "./domain/characters";
import type { CharacterId, HudState, InputState, MatchResult } from "./domain/types";
import type { FightGameController } from "./engine/types";
import "./pixel-fighter.css";

const STORAGE_KEY = "gialoop-fighter";
const EMPTY_HUD: HudState = {
  playerWins: 0,
  enemyWins: 0,
  playerVitality: 100,
  enemyVitality: 100,
  playerScore: 0,
  enemyScore: 0,
  secondsRemaining: 45,
  suddenDeath: false,
  playerName: "Musashi",
  enemyName: "Opponent",
  paused: false,
};

function ArenaPreview({ character, paused }: { character: CharacterId; paused: boolean }) {
  const definition = CHARACTERS[character];

  return (
    <div className="fight-preview" aria-hidden="true">
      <div className="fight-preview-sky" />
      <Image className="fight-preview-tree fight-preview-tree-left" src="/FIGHTGAME_Assets/ENVIRO/Background/tree_trunk8.png" alt="" width={78} height={116} priority />
      <Image className="fight-preview-tree fight-preview-tree-right" src="/FIGHTGAME_Assets/ENVIRO/Background/tree_trunk7.png" alt="" width={74} height={116} priority />
      <Image className="fight-preview-leaves fight-preview-leaves-left" src="/FIGHTGAME_Assets/ENVIRO/Background/tree_leaves2.png" alt="" width={96} height={55} priority />
      <Image className="fight-preview-leaves fight-preview-leaves-right" src="/FIGHTGAME_Assets/ENVIRO/Background/tree_leaves3.png" alt="" width={96} height={55} priority />
      <div className="fight-preview-fog" />
      <div className="fight-preview-platform" />
      <div
        className={`fight-idle fight-idle-${character.toLowerCase()}${paused ? " is-paused" : ""}`}
        style={{ "--idle-duration": `${definition.idle.durationMs}ms`, "--idle-delay": `${definition.idle.delayMs}ms` } as React.CSSProperties}
      >
        <span className="fight-idle-shadow" />
        <Image src={`/FIGHTGAME_Assets/CHARAs/${character}/Idle.png`} alt="" width={76} height={96} priority className="fight-idle-sprite" />
      </div>
      <span className="fight-particle fight-particle-one" />
      <span className="fight-particle fight-particle-two" />
      <span className="fight-particle fight-particle-three" />
    </div>
  );
}

function ControlButton({
  label,
  field,
  children,
  setInput,
}: {
  label: string;
  field: keyof InputState;
  children: React.ReactNode;
  setInput: (field: keyof InputState, pressed: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="fight-touch-button"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setInput(field, true);
      }}
      onPointerUp={(event) => {
        event.preventDefault();
        setInput(field, false);
      }}
      onPointerCancel={() => setInput(field, false)}
      onLostPointerCapture={() => setInput(field, false)}
    >
      {children}
    </button>
  );
}

export default function PixelFighterAdapter({ runtime, actions }: HeroGameAdapterProps) {
  const {
    registerActiveFocus,
    registerPreviewFocus,
    reportError,
    reportLoading,
    reportReady,
    requestExit,
    requestPlay,
    requestResume,
    toggleMuted,
  } = actions;
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<FightGameController | null>(null);
  const previousPhaseRef = useRef(runtime.phase);
  const mutedRef = useRef(runtime.muted);
  const [selected, setSelected] = useState<CharacterId>("MUSASHI");
  const [engineReady, setEngineReady] = useState(false);
  const [hud, setHud] = useState<HudState>(EMPTY_HUD);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [manualPaused, setManualPaused] = useState(false);

  useEffect(() => {
    const stored = parseCharacterSelection(window.localStorage.getItem(STORAGE_KEY));
    if (stored) queueMicrotask(() => setSelected(stored));
  }, []);

  useEffect(() => {
    mutedRef.current = runtime.muted;
    controllerRef.current?.setMuted(runtime.muted);
  }, [runtime.muted]);

  useEffect(() => {
    if (!runtime.nearViewport || !canvasHostRef.current) return;
    const canvasHost = canvasHostRef.current;
    let disposed = false;
    setEngineReady(false);
    reportLoading();

    void import("./engine/mount")
      .then(({ mountFightGame }) => {
        if (disposed) return;
        controllerRef.current = mountFightGame(
          canvasHost,
          selected,
          {
            onReady: () => {
              if (disposed) return;
              setEngineReady(true);
              const canvas = canvasHost.querySelector("canvas");
              registerActiveFocus(canvas);
              reportReady();
            },
            onHud: (nextHud) => {
              if (!disposed) setHud(nextHud);
            },
            onMatchEnd: (nextResult) => {
              if (!disposed) setResult(nextResult);
            },
            onExit: () => {
              if (!disposed) requestExit();
            },
          },
          runtime.reducedMotion,
        );
        controllerRef.current.setMuted(mutedRef.current);
      })
      .catch(reportError);

    return () => {
      disposed = true;
      registerActiveFocus(null);
      controllerRef.current?.destroy();
      controllerRef.current = null;
      canvasHost.replaceChildren();
    };
  }, [registerActiveFocus, reportError, reportLoading, reportReady, requestExit, runtime.nearViewport, runtime.reducedMotion, runtime.retryKey, selected]);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    if (runtime.phase === "active" && previousPhase === "revealing") controllerRef.current?.start();
    if (runtime.phase === "preview" && previousPhase === "exiting") {
      setResult(null);
      setManualPaused(false);
    }
    controllerRef.current?.pause(runtime.phase !== "active" || runtime.hostPaused || manualPaused || Boolean(result));
    previousPhaseRef.current = runtime.phase;
  }, [manualPaused, result, runtime.hostPaused, runtime.phase]);

  const selectCharacter = (character: CharacterId) => {
    if (runtime.phase !== "preview" && runtime.phase !== "loading" && runtime.phase !== "error") return;
    setEngineReady(false);
    reportLoading();
    setSelected(character);
    window.localStorage.setItem(STORAGE_KEY, character);
  };

  const startGame = () => {
    setResult(null);
    setManualPaused(false);
    if (runtime.muted) {
      controllerRef.current?.setMuted(false);
      toggleMuted();
    }
    requestPlay();
  };

  const togglePause = () => setManualPaused((current) => !current);

  const setMobileInput = (field: keyof InputState, pressed: boolean) => {
    controllerRef.current?.setMobileInput({ [field]: pressed });
  };

  const setPreviewFocus = useCallback((element: HTMLButtonElement | null) => {
    registerPreviewFocus(element);
  }, [registerPreviewFocus]);

  const immersive = runtime.phase === "revealing" || runtime.phase === "active" || runtime.phase === "exiting";
  const showingGameUi = runtime.phase === "active";
  const playing = runtime.phase === "active" && !result;
  const paused = manualPaused || runtime.hostPaused;
  const previewPaused = !runtime.inViewport || !runtime.documentVisible || runtime.reducedMotion || immersive;
  const definition = CHARACTERS[selected];

  return (
    <div className="fight-stage">
      <div ref={canvasHostRef} className={`fight-canvas-host${engineReady ? " is-ready" : ""}`} />
      <ArenaPreview character={selected} paused={previewPaused} />

      <div className="fight-scrim" aria-hidden="true" />
      <div className="fight-aperture-ring" aria-hidden="true" />

      {!immersive && (
        <div className="fight-preview-ui">
          <div className="fight-selection-panel">
            <div className="fight-preview-label">
              <span className="text-pixel">PIXEL DUEL</span>
              <strong>Choose your fighter</strong>
              <span><b>{definition.name}</b> · {definition.role}</span>
            </div>

            <div className="fight-roster" aria-label="Choose your fighter">
              {CHARACTER_IDS.map((character) => {
                const item = CHARACTERS[character];
                const selectedCharacter = character === selected;
                return (
                  <button
                    key={character}
                    type="button"
                    className="fight-roster-button"
                    data-selected={selectedCharacter}
                    aria-pressed={selectedCharacter}
                    aria-label={`Choose ${item.name}, ${item.role}`}
                    onClick={() => selectCharacter(character)}
                  >
                    <span className="fight-roster-portrait">
                      <Image src={`/FIGHTGAME_Assets/CHARAs/${character}/Idle.png`} alt="" width={38} height={48} priority />
                    </span>
                    <Image src={`/FIGHTGAME_Assets/CHARAs/${character}/name.png`} alt={item.name} width={43} height={9} priority className="fight-roster-name" />
                  </button>
                );
              })}
            </div>

            <button
              ref={setPreviewFocus}
              type="button"
              className="fight-play-button"
              onClick={startGame}
              disabled={runtime.phase === "loading"}
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              <span>{runtime.phase === "loading" ? "Preparing arena" : "Enter battle"}</span>
            </button>
          </div>
        </div>
      )}

      {showingGameUi && (
        <div className="fight-hud" aria-live="polite">
          <div className="fight-vitality fight-vitality-player">
            <span>{hud.playerName}</span>
            <div><i style={{ width: `${hud.playerVitality}%` }} /></div>
            <b>{hud.playerWins}</b>
          </div>
          <div className="fight-timer">
            <span>{hud.suddenDeath ? "SD" : hud.secondsRemaining}</span>
            <small>BEST OF 3</small>
          </div>
          <div className="fight-vitality fight-vitality-enemy">
            <span>{hud.enemyName}</span>
            <div><i style={{ width: `${hud.enemyVitality}%` }} /></div>
            <b>{hud.enemyWins}</b>
          </div>
        </div>
      )}

      {playing && hud.notice && <div className="fight-notice text-pixel">{hud.notice}</div>}

      {playing && (
        <div className="fight-instructions">
          <span>A/D move</span><span>W jump</span><span>J combo</span><span>K special</span><span>Shift dodge</span>
        </div>
      )}

      {playing && (
        <div className="fight-utility-controls">
          <button type="button" onClick={toggleMuted} aria-label={runtime.muted ? "Turn sound on" : "Mute sound"}>
            {runtime.muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </button>
          <button type="button" onClick={togglePause} aria-label={paused ? "Resume game" : "Pause game"}>
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>
          <button type="button" onClick={requestExit} aria-label="Exit game"><X aria-hidden="true" /></button>
        </div>
      )}

      {playing && (
        <div className="fight-touch-controls" aria-label="Touch game controls">
          <div className="fight-touch-direction">
            <ControlButton label="Move left" field="left" setInput={setMobileInput}>←</ControlButton>
            <ControlButton label="Move right" field="right" setInput={setMobileInput}>→</ControlButton>
          </div>
          <div className="fight-touch-actions">
            <ControlButton label="Jump" field="jump" setInput={setMobileInput}>↑</ControlButton>
            <ControlButton label="Light attack" field="light" setInput={setMobileInput}>J</ControlButton>
            <ControlButton label="Special attack" field="special" setInput={setMobileInput}>K</ControlButton>
            <ControlButton label="Dodge" field="dodge" setInput={setMobileInput}>D</ControlButton>
          </div>
        </div>
      )}

      {paused && playing && (
        <div className="fight-modal-layer">
          <span className="text-pixel">FIGHT PAUSED</span>
          <button type="button" className="pixel-button bg-primary text-primary-foreground" onClick={() => {
            setManualPaused(false);
            requestResume();
          }}>Resume fight</button>
        </div>
      )}

      {runtime.phase === "active" && result && (
        <div className="fight-modal-layer fight-result">
          <span className="text-pixel">{result.winner === "player" ? "VICTORY" : "DEFEAT"}</span>
          <p>{result.playerWins}-{result.enemyWins} against {hud.enemyName}, score {result.playerScore}</p>
          {result.playerScore > 0 && (
            <div className="fight-result-coins" aria-label={`${result.playerScore} match score`}>
              {Array.from({ length: Math.min(5, Math.floor(result.playerScore / 100)) }, (_, index) => (
                <Image key={index} src="/FIGHTGAME_Assets/ITEMs/coin.png" alt="" width={20} height={20} />
              ))}
            </div>
          )}
          <div>
            <button type="button" className="pixel-button bg-primary text-primary-foreground" onClick={() => {
              setResult(null);
              setManualPaused(false);
              controllerRef.current?.replay();
              registerActiveFocus(canvasHostRef.current?.querySelector("canvas") ?? null);
              canvasHostRef.current?.querySelector("canvas")?.focus({ preventScroll: true });
            }}><RotateCcw className="size-4" /> Play again</button>
            <button type="button" className="pixel-button bg-card text-foreground" onClick={requestExit}>Choose fighter</button>
            <Link href="/apps" className="pixel-button bg-card text-foreground">View apps</Link>
          </div>
        </div>
      )}
    </div>
  );
}
