"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CHARACTERS, CHARACTER_IDS, parseCharacterSelection } from "@/game/characters";
import type { FightGameController } from "@/game/fight-game";
import type { CharacterId, HudState, InputState, MatchResult } from "@/game/types";

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

type GamePhase = "preview" | "loading" | "revealing" | "playing" | "result";

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
      <Image className="fight-preview-platform" src="/FIGHTGAME_Assets/ENVIRO/Level%20Design/platform.png" alt="" width={130} height={8} priority />
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

export function FightGameHero() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<FightGameController | null>(null);
  const phaseRef = useRef<GamePhase>("preview");
  const visibleRef = useRef(true);
  const startRequestedRef = useRef(false);
  const revealTimerRef = useRef<number | null>(null);
  const [selected, setSelected] = useState<CharacterId>("MUSASHI");
  const [phase, setPhase] = useState<GamePhase>("preview");
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [muted, setMuted] = useState(true);
  const [hud, setHud] = useState<HudState>(EMPTY_HUD);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [resumeRequired, setResumeRequired] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  function focusCanvas() {
    const canvas = canvasHostRef.current?.querySelector("canvas");
    if (!canvas) return;
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "Pixel fighting game arena");
    canvas.focus({ preventScroll: true });
  }

  function beginReveal() {
    startRequestedRef.current = false;
    setPhase("revealing");
    const revealDuration = reducedMotion ? 0 : 650;
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = window.setTimeout(() => {
      controllerRef.current?.start();
      setPhase("playing");
      focusCanvas();
      revealTimerRef.current = null;
    }, revealDuration);
  }

  function returnToPreview() {
    startRequestedRef.current = false;
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = null;
    controllerRef.current?.pause(true);
    setPhase("preview");
    setResult(null);
    setResumeRequired(false);
    window.setTimeout(() => playButtonRef.current?.focus({ preventScroll: true }), reducedMotion ? 0 : 650);
  }

  useEffect(() => {
    const stored = parseCharacterSelection(window.localStorage.getItem(STORAGE_KEY));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => {
      if (stored) setSelected(stored);
      setReducedMotion(media.matches);
    });
    const updateMotion = () => {
      setEngineReady(false);
      setReducedMotion(media.matches);
    };
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearViewport((current) => current || entry.isIntersecting);
        const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
        setVisible(nextVisible);
        if (!nextVisible && phaseRef.current === "playing") {
          controllerRef.current?.pause(true);
          setResumeRequired(true);
        }
      },
      { rootMargin: "240px 0px", threshold: [0, 0.18, 0.55] },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      setDocumentVisible(!document.hidden);
      if (document.hidden && phaseRef.current === "playing") {
        controllerRef.current?.pause(true);
        setResumeRequired(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => () => {
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
  }, []);

  useEffect(() => {
    if (!nearViewport || !canvasHostRef.current) return;
    const canvasHost = canvasHostRef.current;
    let disposed = false;

    void import("@/game/fight-game")
      .then(({ mountFightGame }) => {
        if (disposed) return;
        controllerRef.current = mountFightGame(
          canvasHost,
          selected,
          {
            onReady: () => {
              if (disposed) return;
              setEngineReady(true);
              if (startRequestedRef.current) beginReveal();
            },
            onHud: (nextHud) => {
              if (!disposed) setHud(nextHud);
            },
            onMatchEnd: (nextResult) => {
              if (!disposed) {
                setResult(nextResult);
                setPhase("result");
              }
            },
            onExit: () => {
              if (!disposed) returnToPreview();
            },
          },
          reducedMotion,
        );
        controllerRef.current.setMuted(muted);
      })
      .catch(() => {
        if (!disposed) setError(true);
      });

    return () => {
      disposed = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      canvasHost.replaceChildren();
    };
  // Muting is updated imperatively without rebuilding the arena.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearViewport, reducedMotion, retryKey, selected]);

  useEffect(() => {
    const active = phase === "revealing" || phase === "playing" || phase === "result";
    document.body.classList.toggle("fight-game-open", active);
    return () => document.body.classList.remove("fight-game-open");
  }, [phase]);

  const selectCharacter = (character: CharacterId) => {
    if (phase !== "preview" && phase !== "loading") return;
    setError(false);
    setEngineReady(false);
    setSelected(character);
    window.localStorage.setItem(STORAGE_KEY, character);
  };

  const startGame = () => {
    setResult(null);
    setResumeRequired(false);
    if (!engineReady) {
      startRequestedRef.current = true;
      setPhase("loading");
      setNearViewport(true);
      return;
    }
    beginReveal();
  };

  const resume = () => {
    if (!visibleRef.current && window.innerWidth >= 768) return;
    controllerRef.current?.pause(false);
    setResumeRequired(false);
    focusCanvas();
  };

  const togglePause = () => {
    const next = !hud.paused;
    controllerRef.current?.pause(next);
    setResumeRequired(next);
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    controllerRef.current?.setMuted(next);
  };

  const setMobileInput = (field: keyof InputState, pressed: boolean) => {
    controllerRef.current?.setMobileInput({ [field]: pressed });
  };

  const active = phase === "revealing" || phase === "playing" || phase === "result";
  const previewPaused = !visible || !documentVisible || reducedMotion || active;
  const definition = CHARACTERS[selected];

  return (
    <section
      ref={frameRef}
      className={`fight-shell${phase === "revealing" ? " is-revealing" : ""}${active ? " is-active" : ""}`}
      aria-label="Playable pixel fighter"
    >
      <div className="fight-stage">
        <div ref={canvasHostRef} className={`fight-canvas-host${engineReady ? " is-ready" : ""}`} />
        <ArenaPreview character={selected} paused={previewPaused} />

        <div className="fight-transition-fighter" aria-hidden="true">
          <span />
          <Image src={`/FIGHTGAME_Assets/CHARAs/${selected}/Idle.png`} alt="" width={76} height={96} priority />
        </div>

        <div className="fight-scrim" aria-hidden="true" />
        <div className="fight-aperture-ring" aria-hidden="true" />

        {!active && (
          <div className="fight-preview-ui">
            <div className="fight-preview-label">
              <span className="text-pixel">CHOOSE YOUR FIGHTER</span>
              <span>{definition.role}</span>
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

            <button ref={playButtonRef} type="button" className="fight-play-button" onClick={startGame} disabled={phase === "loading"}>
              <Play className="size-4 fill-current" aria-hidden="true" />
              <span>{phase === "loading" ? "Loading arena" : "Tap to play"}</span>
            </button>

            {error && (
              <div className="fight-load-error" role="status">
                Arena could not load. The fighter preview is still available.
                <button type="button" onClick={() => {
                  setError(false);
                  setEngineReady(false);
                  setRetryKey((value) => value + 1);
                }}>Retry</button>
              </div>
            )}
          </div>
        )}

        {active && (
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

        {phase === "playing" && hud.notice && <div className="fight-notice text-pixel">{hud.notice}</div>}

        {phase === "playing" && (
          <div className="fight-instructions">
            <span>A/D move</span><span>W jump</span><span>J combo</span><span>K special</span><span>Shift dodge</span>
          </div>
        )}

        {phase === "playing" && (
          <div className="fight-utility-controls">
            <button type="button" onClick={toggleSound} aria-label={muted ? "Turn sound on" : "Mute sound"}>
              {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            </button>
            <button type="button" onClick={togglePause} aria-label={hud.paused ? "Resume game" : "Pause game"}>
              {hud.paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </button>
            <button type="button" onClick={returnToPreview} aria-label="Exit game"><X aria-hidden="true" /></button>
          </div>
        )}

        {phase === "playing" && (
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

        {resumeRequired && phase === "playing" && (
          <div className="fight-modal-layer">
            <span className="text-pixel">FIGHT PAUSED</span>
            <button type="button" className="pixel-button bg-primary text-primary-foreground" onClick={resume}>Resume fight</button>
          </div>
        )}

        {phase === "result" && result && (
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
                setPhase("playing");
                controllerRef.current?.replay();
                focusCanvas();
              }}><RotateCcw className="size-4" /> Play again</button>
              <button type="button" className="pixel-button bg-card text-foreground" onClick={returnToPreview}>Choose fighter</button>
              <Link href="/apps" className="pixel-button bg-card text-foreground">View apps</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
