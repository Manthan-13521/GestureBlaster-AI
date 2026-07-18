import type { Vector2 } from "@/types/common";

export interface PullPhysicsConfig {
  minPullDistance: number;
  maxPullDistance: number;
  maxChargeTime: number;
  cooldownMs: number;
  chargeCurve: (normalized: number) => number;
}

export const DEFAULT_PULL_PHYSICS_CONFIG: PullPhysicsConfig = {
  minPullDistance: 0.02,
  maxPullDistance: 0.4,
  maxChargeTime: 3000,
  cooldownMs: 400,
  chargeCurve: (n: number) => n * n,
};

export interface PullState {
  origin: Vector2 | null;
  currentPosition: Vector2;
  pullVector: Vector2;
  pullDistance: number;
  normalizedPull: number;
  charge: number;
  chargeStartTime: number;
  isFullCharge: boolean;
}

function magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v: Vector2): Vector2 {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export class PullPhysics {
  private config: PullPhysicsConfig;

  constructor(config: Partial<PullPhysicsConfig> = {}) {
    this.config = { ...DEFAULT_PULL_PHYSICS_CONFIG, ...config };
  }

  createPullState(origin: Vector2, currentPosition: Vector2, now: number): PullState {
    const pullVector: Vector2 = {
      x: origin.x - currentPosition.x,
      y: origin.y - currentPosition.y,
    };
    const pullDistance = magnitude(pullVector);
    const normalizedPull = Math.min(
      Math.max(
        (pullDistance - this.config.minPullDistance) /
          (this.config.maxPullDistance - this.config.minPullDistance),
        0,
      ),
      1,
    );
    const charge = this.config.chargeCurve(normalizedPull);
    const isFullCharge = normalizedPull >= 1 || (now - now) >= this.config.maxChargeTime;

    return {
      origin,
      currentPosition,
      pullVector,
      pullDistance,
      normalizedPull,
      charge: Math.min(charge, 1),
      chargeStartTime: now,
      isFullCharge,
    };
  }

  updatePullState(
    state: PullState,
    currentPosition: Vector2,
    now: number,
  ): PullState {
    if (!state.origin) return state;

    const pullVector: Vector2 = {
      x: state.origin.x - currentPosition.x,
      y: state.origin.y - currentPosition.y,
    };
    const pullDistance = magnitude(pullVector);
    const normalizedPull = Math.min(
      Math.max(
        (pullDistance - this.config.minPullDistance) /
          (this.config.maxPullDistance - this.config.minPullDistance),
        0,
      ),
      1,
    );
    const charge = this.config.chargeCurve(normalizedPull);
    const elapsed = now - state.chargeStartTime;
    const isFullCharge = normalizedPull >= 1 || elapsed >= this.config.maxChargeTime;

    return {
      origin: state.origin,
      currentPosition,
      pullVector,
      pullDistance,
      normalizedPull,
      charge: Math.min(charge, 1),
      chargeStartTime: state.chargeStartTime,
      isFullCharge,
    };
  }

  getProjectileDirection(state: PullState): Vector2 {
    return normalize(state.pullVector);
  }

  getProjectileSpeed(state: PullState, minSpeed: number, maxSpeed: number): number {
    return minSpeed + state.charge * (maxSpeed - minSpeed);
  }

  getCooldownMs(): number {
    return this.config.cooldownMs;
  }

  isCooldownElapsed(cooldownStart: number, now: number): boolean {
    return now - cooldownStart >= this.config.cooldownMs;
  }
}
