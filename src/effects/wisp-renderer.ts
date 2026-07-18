import type { Wisp } from "@/engine/wisp";

export class WispRenderer {
  render(ctx: CanvasRenderingContext2D, wisp: Wisp, time: number): void {
    const { position, radius, hitReaction, defeated, charging, respawning } = wisp;

    const pulse = 1 + Math.sin(time * 3 + wisp.phase) * 0.04;
    let r = radius * pulse;

    if (hitReaction > 0 && !defeated) {
      r *= 1 + hitReaction * 2;
    }

    if (defeated) {
      const shrink = Math.max(0, 1 - hitReaction * 2);
      r *= shrink;
    }

    ctx.save();
    ctx.translate(position.x, position.y);

    if (charging) {
      this.renderChargeAura(ctx, r, time);
    }

    this.renderOuterGlow(ctx, r, defeated, charging, hitReaction);

    if (respawning) {
      this.renderRespawnGlow(ctx, r, time);
    }

    if (!defeated || hitReaction > 0) {
      this.renderBody(ctx, r, defeated, charging);
      this.renderEyes(ctx, r, time);
      this.renderTendrils(ctx, r, time);
    }

    if (defeated && hitReaction > 0) {
      this.renderDefeatFlash(ctx, r);
    }

    if (defeated && hitReaction <= 0) {
      this.renderDefeatRings(ctx, r, time);
    }

    ctx.restore();
  }

  private renderOuterGlow(
    ctx: CanvasRenderingContext2D,
    r: number,
    defeated: boolean,
    charging: boolean,
    hitReaction: number,
  ): void {
    const baseAlpha = defeated ? 0.3 : charging ? 0.6 : 0.8;
    const glowColor = charging
      ? `rgba(255, 64, 96, ${baseAlpha})`
      : `rgba(108, 92, 231, ${baseAlpha})`;
    const glowMid = charging
      ? `rgba(200, 60, 80, ${baseAlpha * 0.3})`
      : `rgba(108, 92, 231, ${baseAlpha * 0.3})`;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(0.4, glowMid);
    gradient.addColorStop(1, "rgba(108, 92, 231, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
    ctx.fill();

    if (hitReaction > 0 && !defeated) {
      const flashAlpha = hitReaction * 0.6;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderBody(
    ctx: CanvasRenderingContext2D,
    r: number,
    defeated: boolean,
    charging: boolean,
  ): void {
    const bodyColor = charging ? "#cc3050" : "#6c5ce7";
    const coreColor = charging ? "#ff4060" : "#8b7cf7";

    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = 10;

    const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.5);
    bodyGrad.addColorStop(0, coreColor);
    bodyGrad.addColorStop(1, bodyColor);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.45, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, -r * 0.15, r * 0.2, r * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderEyes(ctx: CanvasRenderingContext2D, r: number, time: number): void {
    const eyeOffset = r * 0.2;
    const eyeY = -r * 0.08;
    const eyeR = r * 0.08;
    const pulse = 1 + Math.sin(time * 5) * 0.15;

    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;

    for (const side of [-1, 1]) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(side * eyeOffset, eyeY, eyeR * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(200, 180, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(side * eyeOffset, eyeY, eyeR * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  private renderTendrils(ctx: CanvasRenderingContext2D, r: number, time: number): void {
    const count = 3;
    ctx.strokeStyle = "rgba(108, 92, 231, 0.3)";
    ctx.lineWidth = 1.5;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i / count) * Math.PI * 2;
      const sway = Math.sin(time * 2 + angleOffset) * 4;
      const baseX = Math.cos(angleOffset + Math.PI * 0.8) * r * 0.3;
      const baseY = r * 0.45;
      const tipY = r * 0.7 + sway;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(baseX + sway * 0.5, baseY + r * 0.15, baseX, tipY);
      ctx.stroke();
    }
  }

  private renderChargeAura(ctx: CanvasRenderingContext2D, r: number, time: number): void {
    const pulseAlpha = 0.15 + Math.sin(time * 8) * 0.1;
    ctx.fillStyle = `rgba(255, 64, 96, ${pulseAlpha})`;
    ctx.shadowColor = "#ff4060";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private renderRespawnGlow(ctx: CanvasRenderingContext2D, r: number, time: number): void {
    const alpha = 0.2 + Math.sin(time * 6) * 0.15;
    ctx.fillStyle = `rgba(0, 245, 212, ${alpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDefeatFlash(ctx: CanvasRenderingContext2D, r: number): void {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, r * 0.5)})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDefeatRings(ctx: CanvasRenderingContext2D, r: number, time: number): void {
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const offset = time * 0.1 + i * 0.3;
      const ringR = r + offset * 40;
      const alpha = Math.max(0, 0.5 - offset * 0.5);
      ctx.strokeStyle = `rgba(108, 92, 231, ${alpha})`;
      ctx.lineWidth = 2 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
