import { ARTILLERY_CONFIG } from "../data/config";
import { clamp, distanceBetween, getTerrainHeight } from "./rules";
import type { MatchState, Owner, ProjectileImpact, ProjectileState, Vector } from "./types";

export function powerToLaunchSpeed(power: number) {
  const progress = (clamp(power, ARTILLERY_CONFIG.minimumPower, ARTILLERY_CONFIG.maximumPower)
    - ARTILLERY_CONFIG.minimumPower)
    / (ARTILLERY_CONFIG.maximumPower - ARTILLERY_CONFIG.minimumPower);
  return ARTILLERY_CONFIG.minimumLaunchSpeed
    + progress * (ARTILLERY_CONFIG.maximumLaunchSpeed - ARTILLERY_CONFIG.minimumLaunchSpeed);
}

export function calculateLaunchVelocity(angle: number, power: number, owner: Owner): Vector {
  const radians = angle * Math.PI / 180;
  const speed = powerToLaunchSpeed(power);
  const direction = owner === "player" ? 1 : -1;
  return {
    x: Math.cos(radians) * speed * direction,
    y: -Math.sin(radians) * speed,
  };
}

export function createProjectile(owner: Owner, position: Vector, angle: number, power: number): ProjectileState {
  return {
    owner,
    position: { ...position },
    velocity: calculateLaunchVelocity(angle, power, owner),
    age: 0,
    hasResolved: false,
  };
}

export function advanceProjectile(projectile: ProjectileState, wind: number, deltaSeconds: number): ProjectileState {
  const velocity = {
    x: projectile.velocity.x + wind * ARTILLERY_CONFIG.windAcceleration * deltaSeconds,
    y: projectile.velocity.y + ARTILLERY_CONFIG.gravity * deltaSeconds,
  };
  return {
    ...projectile,
    velocity,
    position: {
      x: projectile.position.x + velocity.x * deltaSeconds,
      y: projectile.position.y + velocity.y * deltaSeconds,
    },
    age: projectile.age + deltaSeconds,
  };
}

export function detectProjectileCollision(projectile: ProjectileState, state: MatchState): ProjectileImpact | null {
  if (projectile.hasResolved) return null;

  if (projectile.age > 0.12) {
    for (const owner of ["player", "enemy"] as const) {
      if (owner === projectile.owner && projectile.age < 0.28) continue;
      const ant = owner === "player" ? state.player : state.enemy;
      if (distanceBetween(projectile.position, ant.position)
        <= ARTILLERY_CONFIG.antHitRadius + ARTILLERY_CONFIG.projectileRadius) {
        return { kind: "ant", position: { ...projectile.position }, target: owner };
      }
    }
  }

  if (projectile.position.y >= getTerrainHeight(projectile.position.x)) {
    return {
      kind: "ground",
      position: { x: clamp(projectile.position.x, 0, ARTILLERY_CONFIG.worldWidth), y: getTerrainHeight(projectile.position.x) },
    };
  }

  if (
    projectile.position.x < -8
    || projectile.position.x > ARTILLERY_CONFIG.worldWidth + 8
    || projectile.position.y > ARTILLERY_CONFIG.worldHeight + 8
  ) {
    return {
      kind: "bounds",
      position: {
        x: clamp(projectile.position.x, 0, ARTILLERY_CONFIG.worldWidth),
        y: clamp(projectile.position.y, 0, ARTILLERY_CONFIG.worldHeight),
      },
    };
  }

  return null;
}

export function simulateTrajectory({
  projectile,
  wind,
  state,
  pointCount,
  sampleEvery = ARTILLERY_CONFIG.trajectoryStepSeconds,
}: {
  projectile: ProjectileState;
  wind: number;
  state: MatchState;
  pointCount: number;
  sampleEvery?: number;
}) {
  const points: Vector[] = [];
  let next = { ...projectile, position: { ...projectile.position }, velocity: { ...projectile.velocity } };
  const stepsPerPoint = Math.max(1, Math.round(sampleEvery / ARTILLERY_CONFIG.simulationStep));
  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    for (let step = 0; step < stepsPerPoint; step += 1) {
      next = advanceProjectile(next, wind, ARTILLERY_CONFIG.simulationStep);
      if (detectProjectileCollision(next, state)) return points;
    }
    points.push({ ...next.position });
  }
  return points;
}

export interface ProjectileDriverScheduler {
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
}

export class ProjectileDriver {
  private frameId: number | null = null;
  private lastTime: number | null = null;
  private accumulator = 0;
  private paused = false;
  private projectile: ProjectileState | null = null;

  constructor(
    private readonly scheduler: ProjectileDriverScheduler,
    private readonly getState: () => MatchState,
    private readonly onFrame: (projectile: ProjectileState) => void,
    private readonly onImpact: (impact: ProjectileImpact, projectile: ProjectileState) => void,
  ) {}

  start(projectile: ProjectileState) {
    this.cancel();
    this.projectile = projectile;
    this.onFrame(projectile);
    this.frameId = this.scheduler.requestFrame(this.tick);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.lastTime = null;
    if (paused && this.frameId !== null) {
      this.scheduler.cancelFrame(this.frameId);
      this.frameId = null;
    }
    if (!paused && this.projectile && this.frameId === null) {
      this.frameId = this.scheduler.requestFrame(this.tick);
    }
  }

  cancel() {
    if (this.frameId !== null) this.scheduler.cancelFrame(this.frameId);
    this.frameId = null;
    this.lastTime = null;
    this.accumulator = 0;
    this.projectile = null;
  }

  dispose() {
    this.cancel();
  }

  isRunning() {
    return this.projectile !== null;
  }

  private readonly tick = (time: number) => {
    this.frameId = null;
    if (!this.projectile || this.paused) return;
    if (this.lastTime === null) this.lastTime = time;
    const elapsed = Math.min((time - this.lastTime) / 1000, ARTILLERY_CONFIG.maximumFrameDelta);
    this.lastTime = time;
    this.accumulator += elapsed;

    while (this.accumulator >= ARTILLERY_CONFIG.simulationStep && this.projectile) {
      this.projectile = advanceProjectile(
        this.projectile,
        this.getState().wind,
        ARTILLERY_CONFIG.simulationStep,
      );
      this.accumulator -= ARTILLERY_CONFIG.simulationStep;
      const impact = detectProjectileCollision(this.projectile, this.getState());
      if (impact) {
        const resolved = { ...this.projectile, hasResolved: true };
        this.projectile = null;
        this.onFrame(resolved);
        this.onImpact(impact, resolved);
        return;
      }
    }

    if (this.projectile) {
      this.onFrame(this.projectile);
      this.frameId = this.scheduler.requestFrame(this.tick);
    }
  };
}
