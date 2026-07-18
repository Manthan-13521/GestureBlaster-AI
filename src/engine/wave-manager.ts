export class WaveManager {
  time: number = 0;
  wave: number = 1;
  spawnTimer: number = 0;
  difficulty: number = 0;
  private _monsterCount: number = 0;

  get monsterCount(): number {
    return this._monsterCount;
  }

  set monsterCount(v: number) {
    this._monsterCount = v;
  }

  reset(): void {
    this.time = 0;
    this.wave = 1;
    this.spawnTimer = 0;
    this.difficulty = 0;
    this._monsterCount = 0;
  }

  getSpawnInterval(): number {
    return Math.max(0.15, 1.5 - this.difficulty * 0.03);
  }

  getSpawnCount(): number {
    return Math.min(8, 1 + Math.floor(this.difficulty * 0.08));
  }

  getMaxMonsters(): number {
    return Math.min(3000, 20 + Math.floor(this.difficulty * 15));
  }

  getSizeIndex(): number {
    const roll = Math.random();
    const d = this.difficulty;
    if (d < 10) return roll < 0.7 ? 0 : 1;
    if (d < 20) return roll < 0.4 ? 0 : roll < 0.75 ? 1 : 2;
    if (d < 35) return roll < 0.2 ? 0 : roll < 0.5 ? 1 : roll < 0.8 ? 2 : 3;
    if (d < 50) return roll < 0.3 ? 1 : roll < 0.55 ? 2 : roll < 0.8 ? 3 : 4;
    if (d < 70) return roll < 0.2 ? 1 : roll < 0.4 ? 2 : roll < 0.6 ? 3 : roll < 0.85 ? 4 : 5;
    return roll < 0.2 ? 2 : roll < 0.4 ? 3 : roll < 0.65 ? 4 : 5;
  }

  getHpScale(): number {
    return 1 + this.difficulty * 0.05;
  }

  getSpeedScale(): number {
    return 1 + this.difficulty * 0.02;
  }

  tick(dt: number): { spawn: boolean; sizeIndex: number; count: number; hpScale: number; speedScale: number } | null {
    this.time += dt;
    this.difficulty = this.time / 8;
    this.wave = 1 + Math.floor(this.difficulty / 3);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this._monsterCount < this.getMaxMonsters()) {
      this.spawnTimer = this.getSpawnInterval();
      return {
        spawn: true,
        sizeIndex: this.getSizeIndex(),
        count: this.getSpawnCount(),
        hpScale: this.getHpScale(),
        speedScale: this.getSpeedScale(),
      };
    }
    return null;
  }
}
