import type { Vector2 } from "@/types/common";

let nextId = 0;

export class Wisp {
  id: string;
  active: boolean = true;
  position: Vector2;
  radius: number = 28;
  hp: number;
  maxHp: number;
  private baseX: number;
  private baseY: number;
  private driftTime: number = 0;
  phase: number;
  hitReaction: number = 0;
  staggerTimer: number = 0;
  defeated: boolean = false;
  private defeatTimer: number = 0;
  private respawnTimer: number = 0;
  respawning: boolean = false;

  charging: boolean = false;
  chargeTarget: Vector2 = { x: 0, y: 0 };

  constructor(x: number, y: number, hp: number = 3) {
    this.id = `wisp_${nextId++}`;
    this.maxHp = hp;
    this.hp = hp;
    this.position = { x, y };
    this.baseX = x;
    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt: number): void {
    if (!this.active) return;

    if (this.charging) {
      const dx = this.chargeTarget.x - this.position.x;
      const dy = this.chargeTarget.y - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const speed = 350;
        this.position.x += (dx / dist) * speed * dt;
        this.position.y += (dy / dist) * speed * dt;
      }
      return;
    }

    if (this.respawning) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    if (this.staggerTimer > 0) {
      this.staggerTimer -= dt;
    }

    if (this.hitReaction > 0) {
      this.hitReaction -= dt;
      if (this.hitReaction <= 0 && this.defeated) {
        this.defeatTimer = 0.5;
      }
    }

    if (this.defeatTimer > 0) {
      this.defeatTimer -= dt;
      if (this.defeatTimer <= 0) {
        this.respawning = true;
        this.respawnTimer = 0.8;
      }
      return;
    }

    if (this.defeated) return;

    this.driftTime += dt;
    const dx = Math.sin(this.driftTime * 0.6 + this.phase) * 40;
    const dy = Math.cos(this.driftTime * 0.4 + this.phase * 1.3) * 20;
    this.position.x = this.baseX + dx;
    this.position.y = this.baseY + dy;
  }

  startCharging(target: Vector2): void {
    this.charging = true;
    this.chargeTarget = { x: target.x, y: target.y };
  }

  hit(): "stagger" | "defeated" | false {
    if (this.defeated || this.staggerTimer > 0) return false;
    this.hp--;
    if (this.hp <= 0) {
      this.defeated = true;
      this.hitReaction = 0.3;
      return "defeated";
    }
    this.staggerTimer = 0.25;
    this.hitReaction = 0.15;
    return "stagger";
  }

  get isAlive(): boolean {
    return this.active && !this.defeated && !this.respawning && !this.charging;
  }

  get isVulnerable(): boolean {
    return this.active && !this.defeated && !this.respawning && !this.charging;
  }

  private respawn(): void {
    this.baseX = 100 + Math.random() * 600;
    this.baseY = 80 + Math.random() * 200;
    this.position.x = this.baseX;
    this.position.y = this.baseY;
    this.driftTime = 0;
    this.phase = Math.random() * Math.PI * 2;
    this.hp = this.maxHp;
    this.defeated = false;
    this.hitReaction = 0;
    this.staggerTimer = 0;
    this.defeatTimer = 0;
    this.respawning = false;
  }

  destroy(): void {
    this.active = false;
  }
}
