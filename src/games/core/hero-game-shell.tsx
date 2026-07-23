"use client";

import Image from "next/image";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ACTIVE_HERO_GAME, HERO_GAMES } from "../registry";
import { isHeroGameImmersive, reduceHeroGamePhase, shouldPauseHeroGame } from "./lifecycle";
import type { ComponentType } from "react";
import type { HeroGameActions, HeroGameAdapterProps, HeroGameDefinition, HeroGamePhase } from "./types";

interface HeroGameShellProps {
  gameId?: string;
}

interface ModuleBoundaryProps {
  children: React.ReactNode;
  onError: (error: unknown) => void;
  resetKey: number;
}

interface ModuleBoundaryState {
  failed: boolean;
}

class ModuleBoundary extends Component<ModuleBoundaryProps, ModuleBoundaryState> {
  state: ModuleBoundaryState = { failed: false };

  static getDerivedStateFromError(): ModuleBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  componentDidUpdate(previous: ModuleBoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function HeroGameShell({ gameId }: HeroGameShellProps) {
  if (gameId === "") {
    return (
      <section className="hero-game-shell hero-game-none-bg" data-hero-game-id="none" data-presentation="embedded" data-phase="preview">
        <div className="hero-none-backgrounds" aria-hidden="true">
          <picture className="hero-none-bg-layer hero-none-bg-layer-light">
            <source media="(max-width: 767px)" srcSet="/assets/hero/hero_none_apocalypse_pixel_background_mobile.png" />
            <img
              src="/assets/hero/hero_none_apocalypse_pixel_background.png"
              alt=""
              className="hero-none-bg-img"
              decoding="async"
              fetchPriority="high"
            />
          </picture>
          <picture className="hero-none-bg-layer hero-none-bg-layer-dark">
            <source media="(max-width: 767px)" srcSet="/assets/hero/hero_none_apocalypse_pixel_background_mobile_dark.png" />
            <img
              src="/assets/hero/hero_none_apocalypse_pixel_background_dark.png"
              alt=""
              className="hero-none-bg-img"
              decoding="async"
              loading="eager"
            />
          </picture>
        </div>
        <div className="hero-none-celestial-layer" aria-hidden="true">
          <Image
            src="/assets/hero/hero_none_pixel_sun.png"
            alt=""
            width={256}
            height={256}
            className="hero-none-celestial hero-none-sun"
            draggable={false}
            unoptimized
          />
          <Image
            src="/assets/hero/hero_none_pixel_moon.png"
            alt=""
            width={256}
            height={256}
            className="hero-none-celestial hero-none-moon"
            draggable={false}
            unoptimized
          />
        </div>
      </section>
    );
  }
  return <HeroGameShellInner gameId={gameId} />;
}

function HeroGameShellInner({ gameId }: HeroGameShellProps) {
  const definition: HeroGameDefinition = gameId && gameId in HERO_GAMES ? HERO_GAMES[gameId as keyof typeof HERO_GAMES] : ACTIVE_HERO_GAME;
  const frameRef = useRef<HTMLElement>(null);
  const previewFocusRef = useRef<HTMLElement | null>(null);
  const activeFocusRef = useRef<HTMLElement | null>(null);
  const phaseRef = useRef<HeroGamePhase>("preview");
  const visibleRef = useRef(true);
  const documentVisibleRef = useRef(true);
  const readyRef = useRef(false);
  const playRequestedRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<HeroGamePhase>("preview");
  const [inViewport, setInViewport] = useState(true);
  const [nearViewport, setNearViewport] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hostPaused, setHostPaused] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [Adapter, setAdapter] = useState<ComponentType<HeroGameAdapterProps> | null>(null);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  }, []);

  const focusActiveSurface = useCallback(() => {
    const element = activeFocusRef.current;
    if (!element) return;
    if (element.tabIndex < 0) element.tabIndex = 0;
    element.setAttribute("role", "application");
    element.setAttribute("aria-label", definition.ariaLabel);
    element.focus({ preventScroll: true });
  }, [definition.ariaLabel]);

  const beginReveal = useCallback(() => {
    playRequestedRef.current = false;
    clearTransitionTimer();
    setPhase((current) => reduceHeroGamePhase(current, { type: "play", ready: true }));
    transitionTimerRef.current = window.setTimeout(() => {
      setPhase((current) => reduceHeroGamePhase(current, { type: "revealed" }));
      focusActiveSurface();
      transitionTimerRef.current = null;
    }, reducedMotion ? 0 : definition.transition.revealMs);
  }, [clearTransitionTimer, definition.transition.revealMs, focusActiveSurface, reducedMotion]);

  const requestPlay = useCallback(() => {
    setHostPaused(false);
    if (!readyRef.current) {
      playRequestedRef.current = true;
      setNearViewport(true);
      setPhase((current) => reduceHeroGamePhase(current, { type: "play", ready: false }));
      return;
    }
    beginReveal();
  }, [beginReveal]);

  const requestExit = useCallback(() => {
    playRequestedRef.current = false;
    clearTransitionTimer();
    setHostPaused(false);
    setPhase((current) => reduceHeroGamePhase(current, { type: "exit" }));
    transitionTimerRef.current = window.setTimeout(() => {
      setPhase((current) => reduceHeroGamePhase(current, { type: "exited" }));
      previewFocusRef.current?.focus({ preventScroll: true });
      transitionTimerRef.current = null;
    }, reducedMotion ? 0 : definition.transition.exitMs);
  }, [clearTransitionTimer, definition.transition.exitMs, reducedMotion]);

  const reportReady = useCallback(() => {
    readyRef.current = true;
    if (playRequestedRef.current) beginReveal();
  }, [beginReveal]);

  const reportLoading = useCallback(() => {
    readyRef.current = false;
  }, []);

  const reportError = useCallback(() => {
    readyRef.current = false;
    playRequestedRef.current = false;
    clearTransitionTimer();
    setPhase((current) => reduceHeroGamePhase(current, { type: "error" }));
  }, [clearTransitionTimer]);

  const retry = useCallback(() => {
    readyRef.current = false;
    playRequestedRef.current = false;
    setPhase((current) => reduceHeroGamePhase(current, { type: "retry" }));
    setRetryKey((current) => current + 1);
  }, []);

  const requestResume = useCallback(() => {
    if ((!visibleRef.current && window.innerWidth >= 768) || !documentVisibleRef.current) return;
    setHostPaused(false);
    focusActiveSurface();
  }, [focusActiveSurface]);

  const toggleMuted = useCallback(() => setMuted((current) => !current), []);
  const registerPreviewFocus = useCallback((element: HTMLElement | null) => { previewFocusRef.current = element; }, []);
  const registerActiveFocus = useCallback((element: HTMLElement | null) => { activeFocusRef.current = element; }, []);

  const actions = useMemo<HeroGameActions>(() => ({
    requestPlay,
    requestExit,
    requestResume,
    reportReady,
    reportLoading,
    reportError,
    retry,
    toggleMuted,
    registerPreviewFocus,
    registerActiveFocus,
  }), [registerActiveFocus, registerPreviewFocus, reportError, reportLoading, reportReady, requestExit, requestPlay, requestResume, retry, toggleMuted]);

  useEffect(() => {
    let disposed = false;
    void definition.load()
      .then((module) => {
        if (!disposed) setAdapter(() => module.default);
      })
      .catch(reportError);
    return () => { disposed = true; };
  }, [definition, reportError, retryKey]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    visibleRef.current = inViewport;
  }, [inViewport]);

  useEffect(() => {
    documentVisibleRef.current = documentVisible;
  }, [documentVisible]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(([entry]) => {
      setNearViewport((current) => current || entry.isIntersecting);
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
      setInViewport(visible);
      if (shouldPauseHeroGame({
        phase: phaseRef.current,
        inViewport: visible,
        documentVisible: documentVisibleRef.current,
        pauseOffscreen: definition.capabilities.pauseOffscreen,
      })) setHostPaused(true);
    }, { rootMargin: "240px 0px", threshold: [0, 0.18, 0.55] });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [definition.capabilities.pauseOffscreen]);

  useEffect(() => {
    const handleVisibility = () => {
      const visible = !document.hidden;
      setDocumentVisible(visible);
      if (shouldPauseHeroGame({
        phase: phaseRef.current,
        inViewport: visibleRef.current,
        documentVisible: visible,
        pauseOffscreen: definition.capabilities.pauseOffscreen,
      })) setHostPaused(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [definition.capabilities.pauseOffscreen]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const immersive = definition.presentation === "immersive" && isHeroGameImmersive(phase);
    document.body.classList.toggle("hero-game-open", immersive);
    if (definition.presentation === "immersive") document.documentElement.dataset.heroGamePhase = phase;
    else delete document.documentElement.dataset.heroGamePhase;
    return () => {
      document.body.classList.remove("hero-game-open");
      delete document.documentElement.dataset.heroGamePhase;
    };
  }, [definition.presentation, phase]);

  useEffect(() => clearTransitionTimer, [clearTransitionTimer]);

  const gameVisible = phase === "revealing" || phase === "active";

  return (
    <section
      ref={frameRef}
      className={`hero-game-shell${phase === "revealing" ? " is-revealing" : ""}${gameVisible ? " is-active" : ""}${phase === "exiting" ? " is-exiting" : ""}`}
      data-hero-game-id={definition.id}
      data-presentation={definition.presentation}
      data-phase={phase}
      data-near-viewport={nearViewport}
      aria-label={definition.ariaLabel}
      style={{ "--hero-game-reveal-duration": `${definition.transition.revealMs}ms` } as React.CSSProperties}
    >
      <ModuleBoundary resetKey={retryKey} onError={reportError}>
        {Adapter ? (
          <Adapter
            runtime={{ phase, nearViewport, inViewport, documentVisible, reducedMotion, muted, hostPaused, retryKey }}
            actions={actions}
          />
        ) : <div className="hero-game-module-loading" aria-hidden="true" />}
      </ModuleBoundary>

      {phase === "error" && (
        <div className="hero-game-load-error" role="status">
          {definition.errorMessage}
          <button type="button" onClick={retry}>Retry</button>
        </div>
      )}
    </section>
  );
}
