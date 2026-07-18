import type { Vector2 } from "@/types/common";
import type { MonsterConfig } from "./types";

export const MONSTER_SIZES: MonsterConfig[] = [
  { size: "small",  radius: 18, hp: 5,   speed: 55,  damage: 5,  color: "#44ff88", glowColor: "rgba(68,255,136,0.3)", score: 10 },
  { size: "normal", radius: 30, hp: 15,  speed: 45,  damage: 8,  color: "#88ff44", glowColor: "rgba(136,255,68,0.3)", score: 25 },
  { size: "large",  radius: 48, hp: 45,  speed: 35,  damage: 12, color: "#ffaa00", glowColor: "rgba(255,170,0,0.35)", score: 50 },
  { size: "huge",   radius: 72, hp: 120, speed: 25,  damage: 18, color: "#ff5500", glowColor: "rgba(255,85,0,0.4)",  score: 100 },
  { size: "elite",  radius: 100, hp: 300, speed: 18,  damage: 25, color: "#ff0066", glowColor: "rgba(255,0,102,0.45)", score: 200 },
  { size: "boss",   radius: 140, hp: 700, speed: 14, damage: 40, color: "#cc00ff", glowColor: "rgba(204,0,255,0.5)", score: 500 },
];

let nextId = 0;

export class Monster {
  id: number;
  active: boolean = false;
  x: number = 0;
  y: number = 0;
  sizeIndex: number = 0;
  hp: number = 1;
  maxHp: number = 1;
  hitTimer: number = 0;
  deathTimer: number = 0;
  dead: boolean = false;
  phase: number = 0;
  driftAmp: number = 0;
  driftFreq: number = 0;
  spawnTime: number = 0;
  speedMult: number = 1;

  constructor() {
    this.id = nextId++;
    this.phase = Math.random() * Math.PI * 2;
  }

  get config(): MonsterConfig {
    return MONSTER_SIZES[this.sizeIndex] ?? MONSTER_SIZES[0];
  }

  get radius(): number {
    return this.config.radius;
  }

  get speed(): number {
    return this.config.speed * this.speedMult;
  }

  get damage(): number {
    return this.config.damage;
  }

  get score(): number {
    return this.config.score;
  }

  activate(sizeIndex: number, x: number, y: number, time: number, hpScale: number = 1, speedScale: number = 1): void {
    this.sizeIndex = Math.min(sizeIndex, MONSTER_SIZES.length - 1);
    const cfg = this.config;
    this.x = x;
    this.y = y;
    this.maxHp = Math.round(cfg.hp * hpScale);
    this.hp = this.maxHp;
    this.speedMult = speedScale;
    this.hitTimer = 0;
    this.deathTimer = 0;
    this.dead = false;
    this.active = true;
    this.phase = Math.random() * Math.PI * 2;
    this.driftAmp = 5 + Math.random() * 10;
    this.driftFreq = 0.5 + Math.random() * 1.5;
    this.spawnTime = time;
  }

  deactivate(): void {
    this.active = false;
    this.dead = false;
    this.deathTimer = 0;
  }

  hit(dmg: number): boolean {
    if (this.dead || !this.active) return false;
    this.hp -= dmg;
    this.hitTimer = 0.1;
    if (this.hp <= 0) {
      this.dead = true;
      this.deathTimer = 0.3;
      return true;
    }
    return false;
  }

  update(dt: number, centerX: number, centerY: number, time: number): { done: boolean; reached: boolean } {
    if (!this.active) return { done: false, reached: false };
    if (this.dead) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) return { done: true, reached: false };
      return { done: false, reached: false };
    }
    if (this.hitTimer > 0) this.hitTimer = Math.max(0, this.hitTimer - dt);

    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return { done: false, reached: false };

    const drift = Math.sin(time * this.driftFreq + this.phase) * this.driftAmp;
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const moveX = (dx / dist) * this.speed * dt + perpX * drift * dt;
    const moveY = (dy / dist) * this.speed * dt + perpY * drift * dt;
    this.x += moveX;
    this.y += moveY;

    if (dist < 10 + this.radius) return { done: true, reached: true };
    return { done: false, reached: false };
  }
}

export class MonsterPool {
  monsters: Monster[] = [];
  activeCount: number = 0;
  private cursor: number = 0;

  constructor(size: number = 2000) {
    for (let i = 0; i < size; i++) {
      this.monsters.push(new Monster());
    }
  }

  spawn(sizeIndex: number, x: number, y: number, time: number, hpScale: number = 1, speedScale: number = 1): Monster | null {
    for (let i = 0; i < this.monsters.length; i++) {
      const idx = (this.cursor + i) % this.monsters.length;
      if (!this.monsters[idx].active) {
        this.monsters[idx].activate(sizeIndex, x, y, time, hpScale, speedScale);
        this.cursor = (idx + 1) % this.monsters.length;
        this.activeCount++;
        return this.monsters[idx];
      }
    }
    return null;
  }

  update(dt: number, centerX: number, centerY: number, time: number): Monster[] {
    const reached: Monster[] = [];
    for (const m of this.monsters) {
      if (!m.active) continue;
      const result = m.update(dt, centerX, centerY, time);
      if (result.done) {
        if (m.dead) {
          m.deactivate();
          this.activeCount--;
        } else if (result.reached) {
          reached.push(m);
        }
      }
    }
    return reached;
  }

  get active(): Monster[] {
    return this.monsters.filter((m) => m.active);
  }

  clear(): void {
    for (const m of this.monsters) {
      m.deactivate();
    }
    this.activeCount = 0;
  }
}
