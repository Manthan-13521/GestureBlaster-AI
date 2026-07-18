import type { AimInput } from "@/types/input";
import type { EngineStateSnapshot, WeaponStats } from "./types";
import { ProjectilePool } from "./projectile";
import { MonsterPool } from "./monster";
import { WaveManager } from "./wave-manager";
import { getWeaponLevel, getWeaponStats } from "./weapon-system";
import { circleCollision } from "./collision";
import { ParticleSystem } from "@/effects/particle-system";
import { ScreenShake } from "@/effects/screen-shake";
import { ProjectileTrailRenderer } from "@/effects/projectile-trail";
import { ProjectileRenderer } from "@/effects/projectile-renderer";
import { MonsterRenderer } from "@/effects/monster-renderer";
import { PlayerRenderer } from "@/effects/player-renderer";

export type EngineEvent =
  | { type: "fire" }
  | { type: "hit" }
  | { type: "kill"; score: number }
  | { type: "damage"; hp: number }
  | { type: "weaponUpgrade"; level: number; name: string }
  | { type: "gameOver" }
  | { type: "explosion"; x: number; y: number; radius: number; color: string };

const PLAYER_RADIUS = 20;
const CENTER_X = 400;
const CENTER_Y = 300;
const MAX_HP = 100;

export class GameEngine {
  projPool: ProjectilePool;
  monsterPool: MonsterPool;
  waveMgr: WaveManager;
  particles: ParticleSystem;
  shake: ScreenShake;
  trailRenderer: ProjectileTrailRenderer;
  private projRenderer: ProjectileRenderer;
  private monsterRenderer: MonsterRenderer;
  private playerRenderer: PlayerRenderer;

  aimAngle: number = 0;
  weaponLevel: number = 1;
  recoilOffset: number = 0;
  recoilVelocity: number = 0;
  muzzleFlash: number = 0;
  score: number = 0;
  kills: number = 0;
  hp: number = MAX_HP;
  maxHp: number = MAX_HP;
  sessionTime: number = 0;
  gameOver: boolean = false;
  highScore: number = 0;
  canvasW: number = 800;
  canvasH: number = 600;

  private fireTimer: number = 0;
  private weaponStats: WeaponStats = getWeaponStats(1);
  private lastWeaponLevel: number = 1;
  private hpRegenTimer: number = 0;

  onEvent?: (event: EngineEvent) => void;

  constructor() {
    this.projPool = new ProjectilePool(400);
    this.monsterPool = new MonsterPool(3000);
    this.waveMgr = new WaveManager();
    this.particles = new ParticleSystem();
    this.shake = new ScreenShake();
    this.trailRenderer = new ProjectileTrailRenderer();
    this.projRenderer = new ProjectileRenderer();
    this.monsterRenderer = new MonsterRenderer();
    this.playerRenderer = new PlayerRenderer();
  }

  setCenter(x: number, y: number): void {}

  handleInput(input: AimInput, dt: number): void {
    if (this.gameOver) return;
    if (input.isActive) {
      this.aimAngle = input.angle;
    }
  }

  private spawnMonster(): void {
    const w = this.canvasW;
    const h = this.canvasH;
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    const margin = 20;
    switch (side) {
      case 0: x = Math.random() * w; y = -margin; break;
      case 1: x = w + margin; y = Math.random() * h; break;
      case 2: x = Math.random() * w; y = h + margin; break;
      default: x = -margin; y = Math.random() * h; break;
    }
    const sizeIndex = this.waveMgr.getSizeIndex();
    const hpScale = this.waveMgr.getHpScale();
    const speedScale = this.waveMgr.getSpeedScale();
    this.monsterPool.spawn(sizeIndex, x, y, this.sessionTime, hpScale, speedScale);
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.sessionTime += dt;
    this.fireTimer += dt;

    const w = this.canvasW;
    const h = this.canvasH;
    const cx = w / 2;
    const cy = h / 2;

    const spawnResult = this.waveMgr.tick(dt);
    if (spawnResult) {
      for (let i = 0; i < spawnResult.count; i++) {
        this.spawnMonster();
      }
    }

    const fireInterval = 1 / this.weaponStats.fireRate;
    if (this.fireTimer >= fireInterval) {
      this.fireTimer -= fireInterval;
      this.fireProjectile(cx, cy, this.aimAngle);
    }

    this.projPool.update(dt, w, h);

    const reached = this.monsterPool.update(dt, cx, cy, this.sessionTime);

    for (const monster of reached) {
      monster.deactivate();
      this.hp = Math.max(0, this.hp - monster.damage);
      this.onEvent?.({ type: "damage", hp: this.hp });
      this.particles.emitBurst(monster.x, monster.y, 15, "#ff0044");
      this.particles.emitRing(monster.x, monster.y, "#ff0044");
      this.shake.trigger(0.4);
      if (this.hp <= 0) {
        this.gameOver = true;
        this.highScore = Math.max(this.highScore, this.score);
        this.onEvent?.({ type: "gameOver" });
      }
    }

    for (const proj of this.projPool.projectiles) {
      if (!proj.active) continue;
      const pPos = proj.position;
      for (const monster of this.monsterPool.monsters) {
        if (!monster.active || monster.dead) continue;
        if (circleCollision(pPos, proj.weapon.bulletSize, { x: monster.x, y: monster.y }, monster.radius)) {
          const killed = monster.hit(proj.weapon.damage);
          if (killed) {
            this.score += monster.score;
            this.kills++;
            this.onEvent?.({ type: "kill", score: monster.score });
            this.particles.emitBurst(monster.x, monster.y, 20, monster.config.color);
            this.particles.emitRing(monster.x, monster.y, "#ffffff");
            this.shake.trigger(0.2);
            if (proj.weapon.explosive && proj.weapon.explodeRadius > 0) {
              this.handleExplosion(monster.x, monster.y, proj.weapon);
              this.onEvent?.({ type: "explosion", x: monster.x, y: monster.y, radius: proj.weapon.explodeRadius, color: proj.weapon.color });
            }
          } else {
            const angle = Math.atan2(proj.vy, proj.vx);
            this.particles.emitSparks(monster.x, monster.y, 6, proj.weapon.color);
            this.shake.triggerDirectional(0.1, angle, 12);
            this.onEvent?.({ type: "hit" });
          }
          if (!proj.weapon.pierce) {
            proj.deactivate();
          }
          break;
        }
      }
    }

    this.particles.update(dt);
    this.shake.update(dt);

    this.recoilVelocity += -this.recoilOffset * 20 * dt;
    this.recoilVelocity *= 0.85;
    this.recoilOffset += this.recoilVelocity * dt;
    if (Math.abs(this.recoilOffset) < 0.01) this.recoilOffset = 0;

    if (this.muzzleFlash > 0) this.muzzleFlash = Math.max(0, this.muzzleFlash - dt);

    const newLevel = getWeaponLevel(this.score);
    if (newLevel > this.lastWeaponLevel) {
      this.weaponLevel = newLevel;
      this.weaponStats = getWeaponStats(newLevel);
      this.lastWeaponLevel = newLevel;
      this.onEvent?.({ type: "weaponUpgrade", level: newLevel, name: this.weaponStats.name });
      this.particles.emitRing(cx, cy, this.weaponStats.color);
      this.particles.emitBurst(cx, cy, 30, this.weaponStats.color);
      this.shake.trigger(0.5);
    }

    this.hpRegenTimer += dt;
    if (this.hpRegenTimer >= 3 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + 1);
      this.hpRegenTimer = 0;
    }

    this.waveMgr.monsterCount = this.monsterPool.activeCount;
  }

  private fireProjectile(cx: number, cy: number, angle: number): void {
    const spawnDist = 30;
    const sx = cx + Math.cos(angle) * spawnDist;
    const sy = cy + Math.sin(angle) * spawnDist;
    const proj = this.projPool.spawn(sx, sy, angle, this.weaponStats);
    if (proj) {
      this.recoilVelocity -= this.weaponStats.recoil;
      this.muzzleFlash = 0.08;
      this.shake.triggerDirectional(this.weaponStats.shakeIntensity, angle + Math.PI, 15);
      this.onEvent?.({ type: "fire" });
      this.particles.emitSparks(sx, sy, 4, this.weaponStats.muzzleColor);
    }
  }

  private handleExplosion(x: number, y: number, weapon: WeaponStats): void {
    this.particles.emitBurst(x, y, 30, weapon.color);
    this.particles.emitRing(x, y, "#ffffff");
    for (const monster of this.monsterPool.monsters) {
      if (!monster.active || monster.dead) continue;
      const dx = monster.x - x;
      const dy = monster.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= weapon.explodeRadius) {
        const dmg = weapon.splashDamage * (1 - dist / weapon.explodeRadius);
        const killed = monster.hit(dmg);
        if (killed) {
          this.score += monster.score;
          this.kills++;
          this.onEvent?.({ type: "kill", score: monster.score });
          this.particles.emitBurst(monster.x, monster.y, 15, monster.config.color);
        }
      }
    }
  }

  getState(): EngineStateSnapshot {
    return {
      score: this.score,
      kills: this.kills,
      wave: this.waveMgr.wave,
      sessionTime: this.sessionTime,
      hp: this.hp,
      maxHp: this.maxHp,
      gameOver: this.gameOver,
      weaponLevel: this.weaponLevel,
      monsterCount: this.monsterPool.activeCount,
      highScore: this.highScore,
    };
  }

  renderGame(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.canvasW = w;
    this.canvasH = h;
    const shake = this.shake.getOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);
    ctx.clearRect(-10, -10, w + 20, h + 20);

    this.renderBackground(ctx, w, h);

    for (const monster of this.monsterPool.monsters) {
      if (!monster.active) continue;
      this.monsterRenderer.render(ctx, monster, this.sessionTime);
    }

    for (const proj of this.projPool.projectiles) {
      if (!proj.active) continue;
      this.trailRenderer.render(ctx, proj.trail, proj.weapon.trailColor);
      this.projRenderer.render(ctx, proj);
    }

    this.playerRenderer.render(
      ctx, w / 2, h / 2,
      this.aimAngle,
      this.weaponLevel,
      this.recoilOffset,
      this.muzzleFlash,
      this.sessionTime,
    );

    this.renderMonsterHealthBars(ctx);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const cx = w / 2;
    const cy = h / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.4);
    grad.addColorStop(0, "rgba(20, 20, 40, 0.3)");
    grad.addColorStop(1, "rgba(8, 8, 14, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderMonsterHealthBars(ctx: CanvasRenderingContext2D): void {
    const maxBars = 30;
    let count = 0;
    for (const monster of this.monsterPool.monsters) {
      if (!monster.active || monster.dead) continue;
      if (monster.hp >= monster.maxHp) continue;
      count++;
      if (count > maxBars) break;

      const barW = monster.radius * 1.2;
      const barH = 3;
      const bx = monster.x - barW / 2;
      const by = monster.y - monster.radius - 6;
      const ratio = Math.max(0, monster.hp / monster.maxHp);

      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(bx, by, barW, barH);

      ctx.fillStyle = ratio > 0.5 ? monster.config.color : "#ff4444";
      ctx.fillRect(bx, by, barW * ratio, barH);
    }
  }

  renderFX(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const shake = this.shake.getOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);
    ctx.clearRect(-10, -10, w + 20, h + 20);
    this.particles.render(ctx);
    ctx.restore();
  }

  cleanup(): void {
    this.projPool.clear();
    this.monsterPool.clear();
    this.particles.clear();
    this.shake.intensity = 0;
    this.score = 0;
    this.kills = 0;
    this.sessionTime = 0;
    this.hp = MAX_HP;
    this.gameOver = false;
    this.weaponLevel = 1;
    this.lastWeaponLevel = 1;
    this.weaponStats = getWeaponStats(1);
    this.fireTimer = 0;
    this.recoilOffset = 0;
    this.recoilVelocity = 0;
    this.muzzleFlash = 0;
    this.aimAngle = 0;
    this.waveMgr.reset();
  }
}
