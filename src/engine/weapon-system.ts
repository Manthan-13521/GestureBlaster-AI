import type { WeaponStats } from "./types";

export const WEAPON_LEVELS: WeaponStats[] = [
  {
    name: "Basic Blaster",
    fireRate: 5,
    bulletSpeed: 500,
    bulletSize: 4,
    damage: 8,
    recoil: 3,
    color: "#00f5d4",
    trailColor: "rgba(0, 245, 212, 0.4)",
    muzzleColor: "#00f5d4",
    pierce: false,
    explosive: false,
    explodeRadius: 0,
    splashDamage: 0,
    shakeIntensity: 0.12,
  },
  {
    name: "Rapid Blaster",
    fireRate: 10,
    bulletSpeed: 600,
    bulletSize: 5,
    damage: 7,
    recoil: 3.5,
    color: "#ffaa00",
    trailColor: "rgba(255, 170, 0, 0.4)",
    muzzleColor: "#ffcc00",
    pierce: false,
    explosive: false,
    explodeRadius: 0,
    splashDamage: 0,
    shakeIntensity: 0.15,
  },
  {
    name: "Heavy Cannon",
    fireRate: 3.5,
    bulletSpeed: 450,
    bulletSize: 10,
    damage: 35,
    recoil: 8,
    color: "#ff4400",
    trailColor: "rgba(255, 68, 0, 0.5)",
    muzzleColor: "#ff6600",
    pierce: false,
    explosive: true,
    explodeRadius: 60,
    splashDamage: 15,
    shakeIntensity: 0.35,
  },
  {
    name: "Plasma Weapon",
    fireRate: 6,
    bulletSpeed: 700,
    bulletSize: 7,
    damage: 18,
    recoil: 4,
    color: "#00ccff",
    trailColor: "rgba(0, 204, 255, 0.5)",
    muzzleColor: "#66eeff",
    pierce: true,
    explosive: false,
    explodeRadius: 0,
    splashDamage: 0,
    shakeIntensity: 0.2,
  },
  {
    name: "Ultimate Weapon",
    fireRate: 4,
    bulletSpeed: 550,
    bulletSize: 14,
    damage: 50,
    recoil: 12,
    color: "#ff00ff",
    trailColor: "rgba(255, 0, 255, 0.5)",
    muzzleColor: "#ff66ff",
    pierce: true,
    explosive: true,
    explodeRadius: 100,
    splashDamage: 30,
    shakeIntensity: 0.5,
  },
];

export const UPGRADE_THRESHOLDS = [0, 500, 2000, 6000, 15000];

export function getWeaponLevel(score: number): number {
  let level = 0;
  for (let i = UPGRADE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= UPGRADE_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return Math.min(level + 1, WEAPON_LEVELS.length);
}

export function getWeaponStats(level: number): WeaponStats {
  return WEAPON_LEVELS[Math.max(0, Math.min(level - 1, WEAPON_LEVELS.length - 1))];
}
