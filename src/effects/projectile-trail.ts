import type { TrailSegment } from "@/engine/types";

export class ProjectileTrailRenderer {
  render(ctx: CanvasRenderingContext2D, trail: TrailSegment[], color: string): void {
    if (trail.length < 2) return;

    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1];
      const b = trail[i];
      const alpha = Math.max(0, a.life);
      const t = i / trail.length;

      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * 0.5;
      ctx.lineWidth = (1 + t * 3) * alpha;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6 * alpha;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}
