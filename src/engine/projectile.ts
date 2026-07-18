import type { TrailSegment } from "./types";
import type { WeaponStats } from "./types";

let nextId = 0;

export class Projectile {
  id: string;
  active: boolean = false;
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  lifetime: number = 2;
  trail: TrailSegment[] = [];
  weapon: WeaponStats;

  constructor(weapon: WeaponStats) {
    this.id = `proj_${nextId++}`;
    this.weapon = weapon;
  }

  activate(x: number, y: number, angle: number, weapon: WeaponStats): void {
    this.x = x;
    this.y = y;
    this.weapon = weapon;
    this.vx = Math.cos(angle) * weapon.bulletSpeed;
    this.vy = Math.sin(angle) * weapon.bulletSpeed;
    this.lifetime = 2;
    this.trail = [];
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
    this.trail = [];
  }

  update(dt: number): void {
    if (!this.active) return;

    this.trail.push({ x: this.x, y: this.y, life: 1 });
    if (this.trail.length > 8) this.trail.shift();

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    for (const seg of this.trail) seg.life -= dt * 4;
    this.trail = this.trail.filter((s) => s.life > 0);

    this.lifetime -= dt;
    if (this.lifetime <= 0) this.deactivate();
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  isOutOfBounds(w: number, h: number): boolean {
    const margin = 50;
    return (
      this.x < -margin || this.x > w + margin ||
      this.y < -margin || this.y > h + margin
    );
  }
}

export class ProjectilePool {
  projectiles: Projectile[] = [];
  private cursor: number = 0;

  constructor(size: number = 200) {
    const base: WeaponStats = {
      name: "", fireRate: 0, bulletSpeed: 0, bulletSize: 0, damage: 0,
      recoil: 0, color: "", trailColor: "", muzzleColor: "",
      pierce: false, explosive: false, explodeRadius: 0, splashDamage: 0, shakeIntensity: 0,
    };
    for (let i = 0; i < size; i++) {
      this.projectiles.push(new Projectile(base));
    }
  }

  spawn(x: number, y: number, angle: number, weapon: WeaponStats): Projectile | null {
    for (let i = 0; i < this.projectiles.length; i++) {
      const idx = (this.cursor + i) % this.projectiles.length;
      if (!this.projectiles[idx].active) {
        this.projectiles[idx].activate(x, y, angle, weapon);
        this.cursor = (idx + 1) % this.projectiles.length;
        return this.projectiles[idx];
      }
    }
    return null;
  }

  update(dt: number, w: number, h: number): void {
    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.update(dt);
      if (p.isOutOfBounds(w, h)) p.deactivate();
    }
  }

  get active(): Projectile[] {
    return this.projectiles.filter((p) => p.active);
  }

  clear(): void {
    for (const p of this.projectiles) p.deactivate();
  }
}
