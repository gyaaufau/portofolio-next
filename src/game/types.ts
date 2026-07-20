export type CharacterId = "MARSTON" | "MUSASHI" | "NAMKA";

export type AnimationId =
  | "idle"
  | "run"
  | "runArmed"
  | "jump"
  | "fall"
  | "combo1"
  | "combo2"
  | "combo3"
  | "special"
  | "dodge"
  | "hurt"
  | "knockout";

export type ImpactId = "impact1" | "impact2" | "impact3" | "impactHuge";
export type ItemId = "heal" | "cooldown" | "haste" | "coin";
export type ContainerId = "crate" | "metal-crate" | "chest";

export interface AnimationDefinition {
  frames: string[];
  frameRate: number;
  repeat?: number;
}

export interface IdleProfile {
  durationMs: number;
  delayMs: number;
  shiftPx: number;
}

export interface HitWindow {
  atMs: number;
  damage: number;
  range: number;
  verticalRange: number;
  knockback: number;
  lift: number;
  impact: ImpactId;
}

export interface AttackDefinition {
  id: string;
  animation: AnimationId;
  durationMs: number;
  recoveryStartMs: number;
  cooldownMs: number;
  hits: HitWindow[];
  projectileSpeed?: number;
  dashSpeed?: number;
}

export interface ComboDefinition {
  stages: [AttackDefinition, AttackDefinition, AttackDefinition];
  aerialStages: 2;
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  role: string;
  idleFrame: string;
  nameFrame: string;
  speed: number;
  jumpSpeed: number;
  weight: number;
  animations: Record<AnimationId, AnimationDefinition>;
  idle: IdleProfile;
  combo: ComboDefinition;
  special: AttackDefinition;
  ai: {
    aggression: number;
    preferredRange: number;
    dodgeChance: number;
    jumpChance: number;
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
  light: boolean;
  special: boolean;
  dodge: boolean;
}

export interface FighterState {
  character: CharacterId;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  vitality: number;
  grounded: boolean;
  facing: -1 | 1;
  cooldownUntil: number;
  hitStunUntil: number;
  dodgeUntil: number;
  comboStage: number;
}

export interface ActiveItemState {
  x: number;
  y: number;
  kind: "container" | "pickup";
  item?: ItemId;
}

export interface ArenaLayout {
  width: number;
  height: number;
  floorY: number;
  arenaLeft: number;
  arenaRight: number;
  playerSpawnX: number;
  enemySpawnX: number;
  upperPlatforms: Array<{ x: number; y: number; width: number }>;
  blastPaddingX: number;
  blastPaddingTop: number;
  blastPaddingBottom: number;
}

export type AIState = "observe" | "approach" | "retreat" | "jump" | "attack" | "dodge" | "pursue" | "edge-guard" | "recover" | "reposition" | "collect" | "break-container";

export interface AIContext {
  self: FighterState;
  opponent: FighterState;
  now: number;
  arenaWidth: number;
  floorY: number;
  random: number;
  activeItem?: ActiveItemState;
}

export interface AIDecision {
  state: AIState;
  input: InputState;
  holdMs: number;
}

export interface RoundState {
  playerWins: number;
  enemyWins: number;
  playerVitality: number;
  enemyVitality: number;
  playerScore: number;
  enemyScore: number;
  secondsRemaining: number;
  suddenDeath: boolean;
}

export interface MatchResult {
  winner: "player" | "enemy";
  playerWins: number;
  enemyWins: number;
  playerScore: number;
  enemyScore: number;
}

export interface HudState extends RoundState {
  playerName: string;
  enemyName: string;
  paused: boolean;
  notice?: string;
}

export type GameBridge = {
  onReady: () => void;
  onHud: (hud: HudState) => void;
  onMatchEnd: (result: MatchResult) => void;
  onExit: () => void;
};

export const EMPTY_INPUT: InputState = {
  left: false,
  right: false,
  down: false,
  jump: false,
  light: false,
  special: false,
  dodge: false,
};
