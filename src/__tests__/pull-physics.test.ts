import { describe, it, expect } from "vitest";
import { PullPhysics } from "@/input/pull-physics";

describe("PullPhysics", () => {
  it("calculates pull vector as origin minus current", () => {
    const physics = new PullPhysics();
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 400, y: 400 },
      0,
    );
    expect(state.pullVector.x).toBe(100);
    expect(state.pullVector.y).toBe(0);
    expect(state.pullDistance).toBe(100);
  });

  it("calculates normalized pull clamped to 0..1", () => {
    const physics = new PullPhysics({
      minPullDistance: 0,
      maxPullDistance: 100,
    });
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 450, y: 400 },
      0,
    );
    expect(state.normalizedPull).toBeCloseTo(0.5, 5);
  });

  it("clamps normalized pull to minimum", () => {
    const physics = new PullPhysics({
      minPullDistance: 50,
      maxPullDistance: 100,
    });
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 490, y: 400 },
      0,
    );
    expect(state.normalizedPull).toBe(0);
  });

  it("applies quadratic charge curve", () => {
    const physics = new PullPhysics({
      minPullDistance: 0,
      maxPullDistance: 100,
    });
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 450, y: 400 },
      0,
    );
    expect(state.charge).toBeCloseTo(0.25, 5);
  });

  it("updates pull state without changing origin", () => {
    const physics = new PullPhysics({
      minPullDistance: 0,
      maxPullDistance: 100,
    });
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 450, y: 400 },
      0,
    );
    const updated = physics.updatePullState(
      state,
      { x: 400, y: 400 },
      100,
    );
    expect(updated.origin!.x).toBe(500);
    expect(updated.origin!.y).toBe(400);
    expect(updated.pullVector.x).toBe(100);
    expect(updated.currentPosition.x).toBe(400);
  });

  it("returns projectile direction as normalized pull vector", () => {
    const physics = new PullPhysics();
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 400, y: 400 },
      0,
    );
    const dir = physics.getProjectileDirection(state);
    expect(dir.x).toBe(1);
    expect(dir.y).toBe(0);
  });

  it("calculates projectile speed based on charge", () => {
    const physics = new PullPhysics({
      minPullDistance: 0,
      maxPullDistance: 100,
      chargeCurve: (n) => n,
    });
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 450, y: 400 },
      0,
    );
    const speed = physics.getProjectileSpeed(state, 8, 20);
    expect(speed).toBe(14);
  });

  it("checks cooldown elapsed correctly", () => {
    const physics = new PullPhysics({ cooldownMs: 400 });
    expect(physics.isCooldownElapsed(0, 300)).toBe(false);
    expect(physics.isCooldownElapsed(0, 400)).toBe(true);
    expect(physics.isCooldownElapsed(0, 500)).toBe(true);
  });

  it("detects full charge when max pull distance exceeded", () => {
    const physics = new PullPhysics({ minPullDistance: 0, maxPullDistance: 50 });
    const state = physics.createPullState(
      { x: 500, y: 400 },
      { x: 300, y: 400 },
      0,
    );
    expect(state.isFullCharge).toBe(true);
  });
});
