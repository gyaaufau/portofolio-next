import type { ComponentType } from "react";

export type HeroGamePhase = "preview" | "loading" | "revealing" | "active" | "exiting" | "error";

export interface HeroGameCapabilities {
  sound: boolean;
  pauseOffscreen: boolean;
  touchFullscreen: boolean;
}

export interface HeroGameTransition {
  revealMs: number;
  exitMs: number;
}

export interface HeroGameRuntime {
  phase: HeroGamePhase;
  nearViewport: boolean;
  inViewport: boolean;
  documentVisible: boolean;
  reducedMotion: boolean;
  muted: boolean;
  hostPaused: boolean;
  retryKey: number;
}

export interface HeroGameActions {
  requestPlay: () => void;
  requestExit: () => void;
  requestResume: () => void;
  reportReady: () => void;
  reportLoading: () => void;
  reportError: (error?: unknown) => void;
  retry: () => void;
  toggleMuted: () => void;
  registerPreviewFocus: (element: HTMLElement | null) => void;
  registerActiveFocus: (element: HTMLElement | null) => void;
}

export interface HeroGameAdapterProps {
  runtime: HeroGameRuntime;
  actions: HeroGameActions;
}

export interface HeroGameModule {
  default: ComponentType<HeroGameAdapterProps>;
}

export interface HeroGameDefinition {
  id: string;
  name: string;
  ariaLabel: string;
  errorMessage: string;
  capabilities: HeroGameCapabilities;
  transition: HeroGameTransition;
  load: () => Promise<HeroGameModule>;
}
