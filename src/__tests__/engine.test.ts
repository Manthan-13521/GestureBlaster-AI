import { describe, it, expect, vi } from "vitest";
import { Projectile } from "@/engine/projectile";
import { Wisp } from "@/engine/wisp";
import { circleCollision } from "@/engine/collision";
import { GameEngine } from "@/engine/game-engine";
import { ParticleSystem } from "@/effects/particle-system";
import { ScreenShake } from "@/effects/screen-shake";
import type { WeaponInput } from "@/types/input";
import { WaveManager } from "@/engine/wave-manager";

function makeInput(overrides: Partial<WeaponInput> = {}): WeaponInput {
  return {
    isAiming: false,
    isPinching: false,
    origin: null,
    currentPosition: { x: 0, y: 0 },
    pullVector: { x: 0, y: 0 },
    charge: 0,
    released: false,
    cooldown: false,
    handConfidence: 0,
    source: "mouse",
    ...overrides,
  };
}

describe("Projectile", () => {
  it("spawns at given origin", () => {
    const p = new Projectile({ x: 100, y: 200 }, { x: 0, y: -1 }, 500);
    expect(p.position.x).toBe(100);
    expect(p.position.y).toBe(200);
    expect(p.active).toBe(true);
  });

  it("travels in the given direction", () => {
    const p = new Projectile({ x: 0, y: 0 }, { x: 1, y: 0 }, 100);
    p.update(1);
    expect(p.position.x).toBeGreaterThan(0);
    expect(p.position.y).toBe(0);
  });

  it("travels opposite to pull direction (pull up = down)", () => {
    const p = new Projectile({ x: 100, y: 100 }, { x: 1, y: 0 }, 100);
    p.update(1);
    expect(p.position.x).toBeGreaterThan(100);
  });

  it("deactivates after lifetime expires", () => {
    const p = new Projectile({ x: 0, y: 0 }, { x: 0, y: -1 }, 100);
    p.lifetime = 0.5;
    p.update(0.3);
    expect(p.active).toBe(true);
    p.update(0.3);
    expect(p.active).toBe(false);
  });

  it("builds a trail as it moves", () => {
    const p = new Projectile({ x: 0, y: 0 }, { x: 1, y: 0 }, 100);
    expect(p.trail.length).toBe(0);
    p.update(0.016);
    expect(p.trail.length).toBeGreaterThan(0);
  });

  it("can be destroyed", () => {
    const p = new Projectile({ x: 0, y: 0 }, { x: 0, y: 1 }, 100);
    p.destroy();
    expect(p.active).toBe(false);
  });
});

describe("Wisp", () => {
  it("spawns at given position", () => {
    const w = new Wisp(400, 200);
    expect(w.position.x).toBe(400);
    expect(w.position.y).toBe(200);
    expect(w.isAlive).toBe(true);
  });

  it("drifts over time", () => {
    const w = new Wisp(400, 200);
    const startX = w.position.x;
    w.update(1);
    expect(Math.abs(w.position.x - startX)).toBeGreaterThan(0);
  });

  it("reacts to hit with stagger", () => {
    const w = new Wisp(400, 200, 3);
    const result = w.hit();
    expect(result).toBe("stagger");
    expect(w.defeated).toBe(false);
    expect(w.hp).toBe(2);
    expect(w.hitReaction).toBeGreaterThan(0);
    expect(w.staggerTimer).toBeGreaterThan(0);
  });

  it("defeats after depleting HP", () => {
    const w = new Wisp(400, 200, 3);
    expect(w.hit()).toBe("stagger");
    w.staggerTimer = 0;
    expect(w.hit()).toBe("stagger");
    w.staggerTimer = 0;
    const result = w.hit();
    expect(result).toBe("defeated");
    expect(w.defeated).toBe(true);
    expect(w.hp).toBe(0);
  });

  it("does not double-hit during stagger", () => {
    const w = new Wisp(400, 200, 3);
    const r1 = w.hit();
    expect(r1).toBe("stagger");
    const r2 = w.hit();
    expect(r2).toBe(false);
  });

  it("applies invulnerability after each hit", () => {
    const w = new Wisp(400, 200, 3);
    expect(w.hit()).toBe("stagger");
    expect(w.hit()).toBe(false);
    w.update(0.3);
    expect(w.hit()).toBe("stagger");
    expect(w.hit()).toBe(false);
  });

  it("is not alive after defeat", () => {
    const w = new Wisp(400, 200, 3);
    w.hit();
    w.staggerTimer = 0;
    w.hit();
    w.staggerTimer = 0;
    w.hit();
    expect(w.isAlive).toBe(false);
  });

  it("respawns after defeat timer", () => {
    vi.useFakeTimers();
    const w = new Wisp(400, 200, 3);
    w.hit();
    w.staggerTimer = 0;
    w.hit();
    w.staggerTimer = 0;
    w.hit();
    w.update(0.3);
    w.update(0.3);
    w.update(0.3);
    const aliveBefore = w.isAlive;
    expect(aliveBefore).toBe(false);
    w.update(0.5);
    expect(w.isAlive).toBe(true);
    expect(w.hp).toBe(3);
    vi.useRealTimers();
  });
});

describe("circleCollision", () => {
  it("detects overlapping circles", () => {
    expect(circleCollision({ x: 0, y: 0 }, 10, { x: 5, y: 0 }, 10)).toBe(true);
  });

  it("detects non-overlapping circles", () => {
    expect(circleCollision({ x: 0, y: 0 }, 10, { x: 100, y: 0 }, 10)).toBe(false);
  });

  it("detects touching circles", () => {
    expect(circleCollision({ x: 0, y: 0 }, 10, { x: 20, y: 0 }, 10)).toBe(true);
  });
});

describe("ParticleSystem", () => {
  it("emits particles", () => {
    const ps = new ParticleSystem();
    ps.emitBurst(100, 100, 10, "#fff");
    expect(ps.particles.length).toBe(10);
  });

  it("updates particle positions", () => {
    const ps = new ParticleSystem();
    ps.emitBurst(100, 100, 1, "#fff");
    const startX = ps.particles[0].x;
    ps.update(0.016);
    expect(ps.particles[0].x).not.toBe(startX);
  });

  it("removes dead particles", () => {
    const ps = new ParticleSystem();
    ps.emitBurst(100, 100, 1, "#fff");
    ps.particles[0].life = 0.01;
    ps.update(0.1);
    expect(ps.particles.length).toBe(0);
  });

  it("clears all particles", () => {
    const ps = new ParticleSystem();
    ps.emitBurst(100, 100, 10, "#fff");
    ps.clear();
    expect(ps.particles.length).toBe(0);
  });
});

describe("ScreenShake", () => {
  it("starts at zero intensity", () => {
    const ss = new ScreenShake();
    expect(ss.intensity).toBe(0);
  });

  it("triggers with given intensity", () => {
    const ss = new ScreenShake();
    ss.trigger(0.5);
    expect(ss.intensity).toBe(0.5);
  });

  it("decays over time", () => {
    const ss = new ScreenShake();
    ss.trigger(0.5);
    ss.update(0.1);
    expect(ss.intensity).toBeLessThan(0.5);
    expect(ss.intensity).toBeGreaterThan(0);
  });

  it("returns zero offset when idle", () => {
    const ss = new ScreenShake();
    const offset = ss.getOffset();
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
  });
});

describe("GameEngine - slingshot mechanics", () => {
  it("fires projectile on pinch release above threshold", () => {
    const engine = new GameEngine();
    const input = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
      currentPosition: { x: 300, y: 300 },
    });
    engine.handleInput(input, 0.016);
    expect(engine.projectiles.length).toBe(0);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
    });
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);
  });

  it("does not fire below minimum pull threshold", () => {
    const engine = new GameEngine();
    const input = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 2, y: 0 },
      charge: 0.01,
      currentPosition: { x: 398, y: 300 },
    });
    engine.handleInput(input, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      pullVector: { x: 2, y: 0 },
      charge: 0.01,
    });
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(0);
  });

  it("immutable origin: projectile spawns at pinch start position", () => {
    const engine = new GameEngine();
    const input1 = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 50, y: 0 },
      charge: 0.3,
      currentPosition: { x: 350, y: 300 },
    });
    engine.handleInput(input1, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 50, y: 0 },
      charge: 0.3,
    });
    engine.handleInput(release, 0.016);

    expect(engine.projectiles.length).toBe(1);
    expect(engine.projectiles[0].position.x).toBe(400);
    expect(engine.projectiles[0].position.y).toBe(300);
  });

  it("projectile direction is inverse of pull (pull left = travel right)", () => {
    const engine = new GameEngine();
    const input = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
      currentPosition: { x: 300, y: 300 },
    });
    engine.handleInput(input, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
    });
    engine.handleInput(release, 0.016);

    engine.update(0.5);
    expect(engine.projectiles[0].position.x).toBeGreaterThan(400);
    expect(Math.abs(engine.projectiles[0].position.y - 300)).toBeLessThan(1);
  });

  it("enforces cooldown after firing", () => {
    const engine = new GameEngine();
    const pinch = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
      currentPosition: { x: 300, y: 300 },
    });
    engine.handleInput(pinch, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
    });
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);

    engine.handleInput(pinch, 0.016);
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);
  });

  it("fires again after cooldown expires", () => {
    const engine = new GameEngine();
    const pinch = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
      currentPosition: { x: 300, y: 300 },
    });
    engine.handleInput(pinch, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
    });
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);

    const idle = makeInput({ source: "mouse", isPinching: false, charge: 0 });
    for (let i = 0; i < 15; i++) {
      engine.handleInput(idle, 0.016);
    }

    engine.handleInput(pinch, 0.016);
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(2);
  });

  it("handles lost tracking during charge gracefully", () => {
    const engine = new GameEngine();
    const pinch = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
      currentPosition: { x: 300, y: 300 },
    });
    engine.handleInput(pinch, 0.016);

    const lost = makeInput({
      source: "mouse",
      isPinching: false,
      charge: 0,
    });
    engine.handleInput(lost, 0.016);
    expect(engine.projectiles.length).toBe(0);
  });

  it("fires exactly one projectile per release", () => {
    const engine = new GameEngine();
    const pinch = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
      currentPosition: { x: 300, y: 300 },
    });
    engine.handleInput(pinch, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
    });
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);

    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);
  });

  it("can fire with full charge", () => {
    const engine = new GameEngine();
    const pinch = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 400, y: 0 },
      charge: 1,
      currentPosition: { x: 0, y: 300 },
    });
    engine.handleInput(pinch, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 400, y: 0 },
      charge: 1,
    });
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);
  });

  it("cleanup removes all entities", () => {
    const engine = new GameEngine();
    const input = makeInput({
      source: "mouse",
      isPinching: true,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
      currentPosition: { x: 300, y: 300 },
    });
    engine.handleInput(input, 0.016);

    const release = makeInput({
      source: "mouse",
      isPinching: false,
      origin: { x: 400, y: 300 },
      pullVector: { x: 100, y: 0 },
      charge: 0.5,
    });
    engine.handleInput(release, 0.016);
    expect(engine.projectiles.length).toBe(1);

    engine.cleanup();
    expect(engine.projectiles.length).toBe(0);
    expect(engine.particles.particles.length).toBe(0);
  });
});

describe("GameEngine - collision", () => {
  it("detects projectile colliding with wisp", () => {
    const engine = new GameEngine();
    engine.wisp["baseX"] = 400;
    engine.wisp["baseY"] = 300;
    engine.wisp["driftTime"] = 0;
    engine.wisp["phase"] = 0;
    engine.wisp.position.x = 400;
    engine.wisp.position.y = 300;

    const proj = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
    engine.projectiles.push(proj);
    engine.update(0.016);

    expect(engine.wisp.hp).toBeLessThan(3);
  });

  it("triggers impact event on collision", () => {
    const engine = new GameEngine();
    let impactFired = false;
    engine.onEvent = (e) => {
      if (e.type === "impact") impactFired = true;
    };
    engine.wisp["baseX"] = 400;
    engine.wisp["baseY"] = 300;
    engine.wisp["driftTime"] = 0;
    engine.wisp["phase"] = 0;
    engine.wisp.position.x = 400;
    engine.wisp.position.y = 300;

    const proj = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
    engine.projectiles.push(proj);
    engine.update(0.016);

    expect(impactFired).toBe(true);
  });

  it("defeats wisp on third hit", () => {
    const engine = new GameEngine();
    engine.wisp["baseX"] = 400;
    engine.wisp["baseY"] = 300;
    engine.wisp["driftTime"] = 0;
    engine.wisp["phase"] = 0;
    engine.wisp.position.x = 400;
    engine.wisp.position.y = 300;
    engine.wisp["staggerTimer"] = 0;

    for (let i = 0; i < 3; i++) {
      const proj = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
      engine.projectiles.push(proj);
      engine.update(0.016);
      engine.wisp["staggerTimer"] = 0;
    }

    expect(engine.wisp.defeated).toBe(true);
  });
});

describe("GameEngine - scoring", () => {
  it("starts at zero", () => {
    const engine = new GameEngine();
    expect(engine.score).toBe(0);
    expect(engine.shotsFired).toBe(0);
    expect(engine.hits).toBe(0);
  });

  it("increments shotsFired on projectile launch", () => {
    const engine = new GameEngine();
    const pinch = makeInput({ source: "mouse", isPinching: true, charge: 0.5, origin: { x: 400, y: 300 }, pullVector: { x: 100, y: 0 }, currentPosition: { x: 300, y: 300 } });
    engine.handleInput(pinch, 0.016);
    const release = makeInput({ source: "mouse", isPinching: false, charge: 0.5, origin: { x: 400, y: 300 }, pullVector: { x: 100, y: 0 } });
    engine.handleInput(release, 0.016);
    expect(engine.shotsFired).toBe(1);
  });

  it("awards 100 points per hit and 500 on defeat", () => {
    const engine = new GameEngine();
    engine.wisp["baseX"] = 400;
    engine.wisp["baseY"] = 300;
    engine.wisp["driftTime"] = 0;
    engine.wisp["phase"] = 0;
    engine.wisp.position.x = 400;
    engine.wisp.position.y = 300;
    engine.wisp["staggerTimer"] = 0;

    const proj1 = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
    engine.projectiles.push(proj1);
    engine.update(0.016);
    expect(engine.score).toBe(100);
    expect(engine.hits).toBe(1);

    engine.wisp["staggerTimer"] = 0;
    const proj2 = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
    engine.projectiles.push(proj2);
    engine.update(0.016);
    expect(engine.score).toBe(700);
    expect(engine.hits).toBe(2);
  });

  it("tracks session time", () => {
    const engine = new GameEngine();
    expect(engine.sessionTime).toBe(0);
    engine.update(1);
    expect(engine.sessionTime).toBe(1);
  });

  it("getState returns correct snapshot", () => {
    const engine = new GameEngine();
    const state = engine.getState();
    expect(state.score).toBe(0);
    expect(state.shotsFired).toBe(0);
    expect(state.hits).toBe(0);
    expect(state.wave).toBe(1);
    expect(state.wispHp).toBe(2);
    expect(state.wispMaxHp).toBe(2);
    expect(state.isCharging).toBe(false);
  });

  it("cleanup resets scoring state", () => {
    const engine = new GameEngine();
    engine.score = 700;
    engine.shotsFired = 3;
    engine.hits = 3;
    engine.sessionTime = 10;
    engine.cleanup();
    expect(engine.score).toBe(0);
    expect(engine.shotsFired).toBe(0);
    expect(engine.hits).toBe(0);
    expect(engine.sessionTime).toBe(0);
  });
});

describe("GameEngine - wave progression", () => {
  it("starts at wave 1", () => {
    const engine = new GameEngine();
    expect(engine.waveMgr.wave).toBe(1);
  });

  it("advances wave after wisp defeat", () => {
    const engine = new GameEngine();
    engine.wisp["baseX"] = 400;
    engine.wisp["baseY"] = 300;
    engine.wisp["driftTime"] = 0;
    engine.wisp["phase"] = 0;
    engine.wisp.position.x = 400;
    engine.wisp.position.y = 300;
    engine.wisp["staggerTimer"] = 0;

    for (let i = 0; i < 3; i++) {
      const proj = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
      engine.projectiles.push(proj);
      engine.update(0.016);
      engine.wisp["staggerTimer"] = 0;
    }
    expect(engine.waveMgr.wave).toBe(2);
  });

  it("scales wisp HP with wave: 2, 2, 3", () => {
    const engine = new GameEngine();
    expect(engine.waveMgr.getWispHp()).toBe(2);
    engine.waveMgr.advance();
    expect(engine.waveMgr.getWispHp()).toBe(2);
    engine.waveMgr.advance();
    expect(engine.waveMgr.getWispHp()).toBe(3);
  });

  it("caps wisp HP at 10", () => {
    const mgr = new WaveManager();
    for (let i = 0; i < 20; i++) mgr.advance();
    expect(mgr.getWispHp()).toBe(10);
  });

  it("defeat score scales by wave", () => {
    const engine = new GameEngine();
    engine.wisp["baseX"] = 400;
    engine.wisp["baseY"] = 300;
    engine.wisp["driftTime"] = 0;
    engine.wisp["phase"] = 0;
    engine.wisp.position.x = 400;
    engine.wisp.position.y = 300;
    engine.wisp["staggerTimer"] = 0;

    for (let i = 0; i < 3; i++) {
      const proj = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
      engine.projectiles.push(proj);
      engine.update(0.016);
      engine.wisp["staggerTimer"] = 0;
    }
    expect(engine.score).toBe(100 * 2 + 500 * 1);
    expect(engine.waveMgr.wave).toBe(2);

    engine.wisp["hitReaction"] = 0;
    engine.wisp["defeatTimer"] = 0.001;
    for (let i = 0; i < 5; i++) engine.update(0.016);
    engine.wisp["respawnTimer"] = 0;
    engine.update(0.016);

    expect(engine.wisp.hp).toBe(2);

    engine.wisp["baseX"] = 400;
    engine.wisp["baseY"] = 300;
    engine.wisp["driftTime"] = 0;
    engine.wisp["phase"] = 0;
    engine.wisp.position.x = 400;
    engine.wisp.position.y = 300;
    engine.wisp["staggerTimer"] = 0;

    for (let i = 0; i < 4; i++) {
      const proj = new Projectile({ x: 400, y: 300 }, { x: 0, y: -1 }, 200);
      engine.projectiles.push(proj);
      engine.update(0.016);
      engine.wisp["staggerTimer"] = 0;
    }
    expect(engine.score).toBe(100 * 2 + 500 * 1 + 100 * 2 + 500 * 2);
    expect(engine.waveMgr.wave).toBe(3);
  });

  it("reset restores wave to 1", () => {
    const engine = new GameEngine();
    engine.waveMgr.advance();
    engine.waveMgr.advance();
    expect(engine.waveMgr.wave).toBe(3);
    engine.cleanup();
    expect(engine.waveMgr.wave).toBe(1);
  });
});

describe("GameEngine - lives and game over", () => {
  it("starts with 5 lives", () => {
    const engine = new GameEngine();
    expect(engine.lives).toBe(5);
  });

  it("starts with gameOver false", () => {
    const engine = new GameEngine();
    expect(engine.gameOver).toBe(false);
  });

  it("setCenter stores escapeTarget", () => {
    const engine = new GameEngine();
    engine.setCenter(500, 400);
    expect(engine["escapeTarget"].x).toBe(500);
    expect(engine["escapeTarget"].y).toBe(400);
  });

  it("timer expiry triggers escape phase", () => {
    const engine = new GameEngine();
    engine.setCenter(400, 300);
    engine.waveMgr.waveTimer = 0.01;
    engine.update(0.016);
    expect(engine["phase"]).toBe("escaping");
    expect(engine.wisp.charging).toBe(true);
  });

  it("escape completion costs a life", () => {
    const engine = new GameEngine();
    engine.setCenter(400, 300);
    engine.waveMgr.waveTimer = 0.01;
    engine.update(0.016);
    const escapeDuration = 1.2;
    const steps = Math.ceil(escapeDuration / 0.016) + 5;
    for (let i = 0; i < steps; i++) {
      engine.update(0.016);
    }
    expect(engine.lives).toBe(4);
  });

  it("5 escapes cause game over", () => {
    const engine = new GameEngine();
    engine.setCenter(400, 300);
    for (let life = 0; life < 5; life++) {
      engine.waveMgr.waveTimer = 0.01;
      engine.update(0.016);
      const steps = Math.ceil(1.2 / 0.016) + 5;
      for (let i = 0; i < steps; i++) {
        engine.update(0.016);
      }
    }
    expect(engine.lives).toBe(0);
    expect(engine.gameOver).toBe(true);
  });

  it("update is no-op during game over", () => {
    const engine = new GameEngine();
    engine.setCenter(400, 300);
    engine.gameOver = true;
    engine.score = 500;
    engine.update(0.016);
    expect(engine.sessionTime).toBe(0);
  });

  it("getState includes new fields", () => {
    const engine = new GameEngine();
    const state = engine.getState();
    expect(state.lives).toBe(5);
    expect(state.gameOver).toBe(false);
    expect(state.waveTimeLeft).toBeGreaterThan(0);
    expect(state.waveTimeLimit).toBeGreaterThan(0);
  });

  it("restart resets lives, gameOver, score, wave", () => {
    const engine = new GameEngine();
    engine.setCenter(400, 300);
    engine.gameOver = true;
    engine.lives = 0;
    engine.score = 5000;
    engine.waveMgr.wave = 10;
    engine.restart();
    expect(engine.lives).toBe(5);
    expect(engine.gameOver).toBe(false);
    expect(engine.score).toBe(0);
    expect(engine.waveMgr.wave).toBe(1);
  });

  it("wisp moves toward escapeTarget during charge", () => {
    const engine = new GameEngine();
    engine.setCenter(400, 300);
    const wisp = engine.wisp;
    wisp.startCharging({ x: 400, y: 300 });
    const startX = wisp.position.x;
    const startY = wisp.position.y;
    wisp.update(0.016);
    const movedX = Math.abs(wisp.position.x - startX);
    const movedY = Math.abs(wisp.position.y - startY);
    expect(movedX + movedY).toBeGreaterThan(0);
  });
});

describe("WaveManager - timer", () => {
  it("wave timer starts at time limit", () => {
    const mgr = new WaveManager();
    expect(mgr.waveTimer).toBe(30);
    expect(mgr.waveTimeLimit).toBe(30);
  });

  it("advance recalculates time limit and resets timer", () => {
    const mgr = new WaveManager();
    mgr.advance();
    expect(mgr.wave).toBe(2);
    expect(mgr.waveTimeLimit).toBe(28);
    expect(mgr.waveTimer).toBe(28);
  });

  it("tick decrements timer", () => {
    const mgr = new WaveManager();
    mgr.tick(1);
    expect(mgr.waveTimer).toBe(29);
  });

  it("tick returns timeout when timer expires", () => {
    const mgr = new WaveManager();
    mgr.waveTimer = 0.01;
    expect(mgr.tick(0.02)).toBe("timeout");
    expect(mgr.waveTimer).toBe(0);
  });

  it("resetWaveTimer applies penalty", () => {
    const mgr = new WaveManager();
    mgr.resetWaveTimer(5);
    expect(mgr.waveTimer).toBe(25);
  });

  it("resetWaveTimer floors at 5", () => {
    const mgr = new WaveManager();
    mgr.waveTimer = 0;
    mgr.resetWaveTimer(100);
    expect(mgr.waveTimer).toBe(5);
  });
});
