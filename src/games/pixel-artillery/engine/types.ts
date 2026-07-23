export type Owner = "player" | "enemy";
export type Turn = Owner | "none";
export type MatchPhase =
  | "ready"
  | "playerAiming"
  | "playerProjectile"
  | "resolvingPlayerHit"
  | "enemyThinking"
  | "enemyProjectile"
  | "resolvingEnemyHit"
  | "playerWon"
  | "playerLost";

export interface Vector {
  x: number;
  y: number;
}

export interface AntState {
  health: number;
  position: Vector;
}

export interface ProjectileState {
  owner: Owner;
  position: Vector;
  velocity: Vector;
  age: number;
  hasResolved: boolean;
}

export type ImpactKind = "ant" | "ground" | "bounds";

export interface ProjectileImpact {
  kind: ImpactKind;
  position: Vector;
  target?: Owner;
}

export interface DamageResult {
  player: number;
  enemy: number;
}

export interface EnemyAim {
  angle: number;
  power: number;
  quality: "poor" | "near" | "strong";
}

export interface MatchState {
  phase: MatchPhase;
  turn: Turn;
  player: AntState;
  enemy: AntState;
  aimAngle: number;
  shotPower: number;
  enemyAim: EnemyAim | null;
  wind: number;
  pendingImpact: ProjectileImpact | null;
  lastDamage: DamageResult | null;
  turnNumber: number;
  isFocused: boolean;
  announcement: string;
}

export type MatchEvent =
  | { type: "START" }
  | { type: "RETURN_TO_READY"; wind: number }
  | { type: "ADJUST_ANGLE"; delta: number }
  | { type: "ADJUST_POWER"; delta: number }
  | { type: "FIRE"; owner: Owner }
  | { type: "AI_AIM"; aim: EnemyAim }
  | { type: "IMPACT"; owner: Owner; impact: ProjectileImpact; damage: DamageResult }
  | { type: "RESOLVE_IMPACT"; owner: Owner; nextWind: number }
  | { type: "RESTART"; wind: number }
  | { type: "FOCUS" }
  | { type: "BLUR" };

export type RandomSource = () => number;
