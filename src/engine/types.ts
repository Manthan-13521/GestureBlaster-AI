import type { Vector2 } from "@/types/common";

export type ParticleKind = "spark" | "glow" | "debris" | "explosion";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: ParticleKind;
  rotation?: number;
  rotationSpeed?: number;
  gravity?: number;
}

export interface TrailSegment {
  x: number;
  y: number;
  life: number;
}

export interface WeaponStats {
  name: string;
  fireRate: number;
  bulletSpeed: number;
  bulletSize: number;
  damage: number;
  recoil: number;
  color: string;
  trailColor: string;
  muzzleColor: string;
  pierce: boolean;
  explosive: boolean;
  explodeRadius: number;
  splashDamage: number;
  shakeIntensity: number;
}

export interface MonsterConfig {
  size: string;
  radius: number;
  hp: number;
  speed: number;
  damage: number;
  color: string;
  score: number;
  glowColor: string;
}

export interface EngineStateSnapshot {
  score: number;
  kills: number;
  wave: number;
  sessionTime: number;
  hp: number;
  maxHp: number;
  gameOver: boolean;
  weaponLevel: number;
  monsterCount: number;
  highScore: number;
}
