import type { Monster } from "@/engine/monster";

export class MonsterRenderer {
  render(ctx: CanvasRenderingContext2D, monster: Monster, time: number): void {
    if (!monster.active) return;
    const { x, y, radius, hitTimer, dead, deathTimer, sizeIndex } = monster;
    if (dead && deathTimer <= 0) return;

    const pulse = 1 + Math.sin(time * 2 + monster.phase) * 0.04;
    let r = radius * pulse;

    ctx.save();
    ctx.translate(x, y);

    if (dead) {
      const shrink = Math.max(0, deathTimer / 0.3);
      r *= shrink;
      ctx.globalAlpha = shrink;
    }

    if (hitTimer > 0) {
      r *= 1 + hitTimer * 1.5;
    }

    const wobble = Math.sin(time * 4 + monster.phase) * r * 0.03;

    this.renderGlow(ctx, r, monster);
    this.renderBodyShape(ctx, r, time, sizeIndex, wobble, monster);
    this.renderLimbs(ctx, r, time, sizeIndex);
    this.renderMaw(ctx, r, time, sizeIndex);
    this.renderEyes(ctx, r, time, sizeIndex);
    this.renderSpikes(ctx, r, time, sizeIndex);

    if (dead && deathTimer > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, deathTimer * 3)})`;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderGlow(ctx: CanvasRenderingContext2D, r: number, monster: Monster): void {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    grad.addColorStop(0, monster.config.color);
    grad.addColorStop(0.3, monster.config.glowColor);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderBodyShape(
    ctx: CanvasRenderingContext2D,
    r: number, time: number,
    sizeIndex: number,
    wobble: number,
    monster: Monster,
  ): void {
    const bodyColor = monster.hitTimer > 0 ? "#ffffff" : monster.config.color;
    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = monster.hitTimer > 0 ? 25 : 10;

    const bodyGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.15, 0, 0, 0, r * 0.8);
    bodyGrad.addColorStop(0, "#ffffff");
    bodyGrad.addColorStop(0.15, bodyColor);
    bodyGrad.addColorStop(0.5, monster.config.color);
    bodyGrad.addColorStop(1, "rgba(20,0,40,0.8)");
    ctx.fillStyle = bodyGrad;

    if (sizeIndex <= 1) {
      ctx.beginPath();
      ctx.ellipse(0, wobble, r * 0.65, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (sizeIndex <= 2) {
      ctx.beginPath();
      ctx.ellipse(0, wobble * 0.5, r * 0.7, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (sizeIndex <= 3) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, r * 0.15 + wobble);
      ctx.quadraticCurveTo(-r * 0.7, -r * 0.3 + wobble, -r * 0.15, -r * 0.5 + wobble);
      ctx.quadraticCurveTo(0, -r * 0.6 + wobble, r * 0.15, -r * 0.5 + wobble);
      ctx.quadraticCurveTo(r * 0.7, -r * 0.3 + wobble, r * 0.6, r * 0.15 + wobble);
      ctx.quadraticCurveTo(r * 0.5, r * 0.5 + wobble, 0, r * 0.55 + wobble);
      ctx.quadraticCurveTo(-r * 0.5, r * 0.5 + wobble, -r * 0.6, r * 0.15 + wobble);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, r * 0.2 + wobble);
      ctx.quadraticCurveTo(-r * 0.8, -r * 0.2 + wobble, -r * 0.3, -r * 0.5 + wobble);
      ctx.quadraticCurveTo(0, -r * 0.7 + wobble, r * 0.3, -r * 0.5 + wobble);
      ctx.quadraticCurveTo(r * 0.8, -r * 0.2 + wobble, r * 0.5, r * 0.2 + wobble);
      ctx.quadraticCurveTo(r * 0.4, r * 0.55 + wobble, 0, r * 0.6 + wobble);
      ctx.quadraticCurveTo(-r * 0.4, r * 0.55 + wobble, -r * 0.5, r * 0.2 + wobble);
      ctx.closePath();
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    if (sizeIndex >= 2) {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath();
      ctx.ellipse(-r * 0.12, -r * 0.15 + wobble, r * 0.25, r * 0.35, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderLimbs(ctx: CanvasRenderingContext2D, r: number, time: number, sizeIndex: number): void {
    const limbCount = sizeIndex <= 1 ? 4 : 6;
    const strokeW = Math.max(2, r * 0.08);
    ctx.strokeStyle = `rgba(0,0,0,0.25)`;
    ctx.lineWidth = strokeW;
    ctx.lineCap = "round";

    for (let i = 0; i < limbCount; i++) {
      const baseAngle = (i / limbCount) * Math.PI * 2 + time * 0.6 + i * 0.3;
      const legSwing = Math.sin(time * 2.5 + i * 1.2) * r * 0.12;
      const legLen = r * (sizeIndex <= 1 ? 0.5 : 0.55);
      const startR = r * 0.45;

      const sx = Math.cos(baseAngle) * startR;
      const sy = Math.sin(baseAngle) * startR * 0.7 + r * 0.1;
      const ex = Math.cos(baseAngle) * (startR + legLen);
      const ey = Math.sin(baseAngle) * (startR + legLen) * 0.7 + r * 0.1 + legSwing;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo((sx + ex) / 2 + legSwing * 0.3, (sy + ey) / 2 + r * 0.05, ex, ey);
      ctx.stroke();
    }

    if (sizeIndex >= 3) {
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = strokeW * 0.6;
      for (let i = 0; i < limbCount; i++) {
        const baseAngle = (i / limbCount) * Math.PI * 2 + time * 0.5 + i * 0.3 + Math.PI / 6;
        const sway = Math.sin(time * 1.8 + i) * r * 0.08;
        const len = r * 0.35;
        const sr = r * 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(baseAngle) * sr, Math.sin(baseAngle) * sr * 0.5);
        ctx.lineTo(Math.cos(baseAngle + 0.15) * (sr + len), Math.sin(baseAngle + 0.15) * (sr + len) * 0.5 + sway);
        ctx.stroke();
      }
    }
  }

  private renderMaw(ctx: CanvasRenderingContext2D, r: number, time: number, sizeIndex: number): void {
    const mawOpen = 0.3 + Math.sin(time * 2 + monsterPhase(time)) * 0.15;
    const mawH = r * 0.2 * mawOpen;
    const mawW = r * (sizeIndex <= 1 ? 0.25 : 0.35);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, mawW, mawH, 0, 0, Math.PI * 2);
    ctx.fill();

    if (sizeIndex >= 2) {
      const teethCount = 3 + sizeIndex;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let i = 0; i < teethCount; i++) {
        const tx = -mawW + (i / (teethCount - 1)) * mawW * 2;
        const ty = r * 0.2 - mawH * 0.5;
        const th = r * 0.06;
        const tw = r * 0.04;
        ctx.beginPath();
        ctx.moveTo(tx - tw, ty);
        ctx.lineTo(tx, ty - th);
        ctx.lineTo(tx + tw, ty);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      for (let i = 0; i < teethCount; i++) {
        const tx = -mawW + (i / (teethCount - 1)) * mawW * 2;
        const ty = r * 0.2 + mawH * 0.5;
        const th = r * 0.04;
        const tw = r * 0.035;
        ctx.beginPath();
        ctx.moveTo(tx - tw, ty);
        ctx.lineTo(tx, ty + th);
        ctx.lineTo(tx + tw, ty);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private renderEyes(ctx: CanvasRenderingContext2D, r: number, time: number, sizeIndex: number): void {
    const eyeR = r * (sizeIndex >= 4 ? 0.13 : sizeIndex >= 2 ? 0.11 : 0.09);
    const eyeOff = r * 0.22;
    const eyeY = -r * 0.1;
    const glow = 1 + Math.sin(time * 3) * 0.15;

    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 8;

    for (const side of [-1, 1]) {
      ctx.fillStyle = "rgba(255,50,50,0.9)";
      ctx.beginPath();
      ctx.arc(side * eyeOff, eyeY, eyeR * glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,200,50,0.6)";
      ctx.beginPath();
      ctx.arc(side * eyeOff + side * eyeR * 0.15, eyeY - eyeR * 0.1, eyeR * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.beginPath();
      ctx.arc(side * eyeOff + side * eyeR * 0.2, eyeY - eyeR * 0.05, eyeR * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  private renderSpikes(ctx: CanvasRenderingContext2D, r: number, time: number, sizeIndex: number): void {
    if (sizeIndex < 2) return;

    const spikeCount = 5 + sizeIndex * 2;
    const spikeH = r * (sizeIndex >= 4 ? 0.3 : sizeIndex >= 3 ? 0.22 : 0.15);

    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.sin(time) * 0.05})`;

    for (let i = 0; i < spikeCount; i++) {
      const a = (i / spikeCount) * Math.PI * 2 - Math.PI / 2 + Math.sin(time * 1.2 + i) * 0.08;
      const baseR = r * 0.55;
      const tipR = baseR + spikeH;
      const sway = Math.sin(time * 2 + i * 0.8) * r * 0.03;

      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.12) * baseR, Math.sin(a - 0.12) * baseR);
      ctx.lineTo(Math.cos(a) * tipR, Math.sin(a) * tipR + sway);
      ctx.lineTo(Math.cos(a + 0.12) * baseR, Math.sin(a + 0.12) * baseR);
      ctx.closePath();
      ctx.fill();
    }

    if (sizeIndex >= 4) {
      ctx.fillStyle = `rgba(255,100,100,${0.08 + Math.sin(time * 1.5) * 0.04})`;
      for (let i = 0; i < spikeCount; i++) {
        const a = (i / spikeCount) * Math.PI * 2 + time * 0.8 + i * 0.5;
        const baseR = r * 0.6;
        const tipR = baseR + r * 0.45;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a - 0.08) * baseR, Math.sin(a - 0.08) * baseR);
        ctx.lineTo(Math.cos(a) * tipR, Math.sin(a) * tipR);
        ctx.lineTo(Math.cos(a + 0.08) * baseR, Math.sin(a + 0.08) * baseR);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

function monsterPhase(time: number): number {
  return time * 2;
}
