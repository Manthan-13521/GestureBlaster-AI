import type { Projectile } from "@/engine/projectile";

export class ProjectileRenderer {
  render(ctx: CanvasRenderingContext2D, proj: Projectile): void {
    if (!proj.active) return;
    const angle = Math.atan2(proj.vy, proj.vx);
    const { bulletSize, color } = proj.weapon;
    const len = bulletSize * 3;
    const width = bulletSize;

    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.rotate(angle);

    ctx.shadowColor = color;
    ctx.shadowBlur = 16;

    const grad = ctx.createLinearGradient(-len / 2, 0, len / 2, 0);
    grad.addColorStop(0, `${color}1a`);
    grad.addColorStop(0.3, `${color}99`);
    grad.addColorStop(0.7, color);
    grad.addColorStop(1, "#ffffff");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, len / 2, width / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(len * 0.25, 0, width * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
