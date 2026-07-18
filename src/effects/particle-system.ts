import type { Particle, ParticleKind } from "@/engine/types";

interface ImpactRing {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
}

export class ParticleSystem {
  particles: Particle[] = [];
  private rings: ImpactRing[] = [];

  emitBurst(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const kind: ParticleKind = i < count * 0.4 ? "spark" : i < count * 0.7 ? "glow" : "debris";
      this.emitParticle(x, y, color, kind);
    }
  }

  emitSparks(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      this.emitParticle(x, y, color, "spark");
    }
  }

  emitGlowOrbs(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      this.emitParticle(x, y, color, "glow");
    }
  }

  emitRing(x: number, y: number, color: string): void {
    this.rings.push({ x, y, life: 0.3, maxLife: 0.3, color });
  }

  emitExplosion(x: number, y: number, radius: number, color: string): void {
    const count = Math.min(40, Math.floor(radius * 0.4));
    for (let i = 0; i < count; i++) {
      const kind: ParticleKind = i < count * 0.3 ? "explosion" : "glow";
      this.emitParticle(x, y, color, kind);
    }
    this.emitRing(x, y, "#ffffff");
    this.rings.push({ x, y, life: 0.6, maxLife: 0.6, color: "#ffffff" });
  }

  private emitParticle(x: number, y: number, color: string, kind: ParticleKind): Particle {
    const angle = Math.random() * Math.PI * 2;
    let speed: number;
    let life: number;
    let size: number;
    let gravity: number = 0;
    let rotationSpeed: number = 0;

    switch (kind) {
      case "spark":
        speed = 100 + Math.random() * 300;
        life = 0.2 + Math.random() * 0.3;
        size = 1 + Math.random() * 1.5;
        break;
      case "glow":
        speed = 30 + Math.random() * 80;
        life = 0.6 + Math.random() * 0.6;
        size = 4 + Math.random() * 5;
        gravity = -20;
        break;
      case "debris":
        speed = 60 + Math.random() * 150;
        life = 0.3 + Math.random() * 0.4;
        size = 2 + Math.random() * 3;
        gravity = 150;
        rotationSpeed = (Math.random() - 0.5) * 10;
        break;
      case "explosion":
        speed = 200 + Math.random() * 400;
        life = 0.3 + Math.random() * 0.4;
        size = 6 + Math.random() * 8;
        break;
    }

    const particle: Particle = {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size,
      color,
      kind,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed,
      gravity,
    };
    this.particles.push(particle);
    return particle;
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.rotation !== undefined && p.rotationSpeed) {
        p.rotation += p.rotationSpeed * dt;
      }
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const ring of this.rings) {
      ring.life -= dt;
    }
    this.rings = this.rings.filter((r) => r.life > 0);
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const ring of this.rings) {
      const progress = 1 - ring.life / ring.maxLife;
      const alpha = Math.max(0, 1 - progress);
      const radius = 8 + progress * 50;
      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = alpha * 0.6;
      ctx.lineWidth = 2.5 * alpha;
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 6 * alpha;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha * 0.85;

      switch (p.kind) {
        case "spark":
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
          ctx.shadowBlur = 0;
          break;
        case "glow":
        case "explosion": {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.kind === "explosion" ? 20 : 12;
          const r = p.size * (0.5 + alpha * 0.5);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        }
        case "debris": {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation ?? 0);
          ctx.fillStyle = p.color;
          const s = p.size * alpha;
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  clear(): void {
    this.particles = [];
    this.rings = [];
  }
}
