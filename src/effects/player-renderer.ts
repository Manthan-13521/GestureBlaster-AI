export class PlayerRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    aimAngle: number,
    weaponLevel: number,
    recoilOffset: number,
    muzzleFlash: number,
    time: number,
  ): void {
    ctx.save();
    ctx.translate(x, y);

    this.renderCenterGlow(ctx, time);
    this.renderCharacterBody(ctx, time);
    this.renderWeapon(ctx, aimAngle, weaponLevel, recoilOffset, muzzleFlash, time);

    ctx.restore();
  }

  private renderCharacterBody(ctx: CanvasRenderingContext2D, time: number): void {
    const breathe = Math.sin(time * 1.5) * 1.5;
    const bodyR = 30;

    ctx.shadowColor = "#6c5ce7";
    ctx.shadowBlur = 30;

    const bodyGrad = ctx.createRadialGradient(-8, -4 + breathe, 0, 0, 2 + breathe, bodyR);
    bodyGrad.addColorStop(0, "#a093f7");
    bodyGrad.addColorStop(0.4, "#6c5ce7");
    bodyGrad.addColorStop(0.8, "#4834d4");
    bodyGrad.addColorStop(1, "#2d1fa0");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 2 + breathe, bodyR, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.ellipse(-8, -6 + breathe, 10, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    const eyeY = -3 + breathe;
    const eyeOff = 10;

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-eyeOff, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeOff, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(-eyeOff + 1.5, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeOff + 1.5, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(-3, 6 + breathe, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.arc(0, bodyR - 4, bodyR * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderWeapon(
    ctx: CanvasRenderingContext2D,
    angle: number,
    weaponLevel: number,
    recoilOffset: number,
    muzzleFlash: number,
    time: number,
  ): void {
    ctx.save();
    ctx.rotate(angle);

    const recoil = Math.max(0, 8 + recoilOffset);
    const len = 40;
    const w = 10 + weaponLevel * 2;

    ctx.translate(28 - recoil, 0);

    ctx.shadowColor = "#6c5ce7";
    ctx.shadowBlur = 12;

    const bodyGrad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
    if (weaponLevel >= 5) {
      bodyGrad.addColorStop(0, "#ff00ff");
      bodyGrad.addColorStop(0.5, "#ff66ff");
      bodyGrad.addColorStop(1, "#cc00cc");
    } else if (weaponLevel >= 4) {
      bodyGrad.addColorStop(0, "#00ccff");
      bodyGrad.addColorStop(0.5, "#66eeff");
      bodyGrad.addColorStop(1, "#0099cc");
    } else if (weaponLevel >= 3) {
      bodyGrad.addColorStop(0, "#ff4400");
      bodyGrad.addColorStop(0.5, "#ff6600");
      bodyGrad.addColorStop(1, "#cc3300");
    } else if (weaponLevel >= 2) {
      bodyGrad.addColorStop(0, "#ffaa00");
      bodyGrad.addColorStop(0.5, "#ffcc00");
      bodyGrad.addColorStop(1, "#cc8800");
    } else {
      bodyGrad.addColorStop(0, "#00f5d4");
      bodyGrad.addColorStop(0.5, "#00cca8");
      bodyGrad.addColorStop(1, "#009977");
    }

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(0, -w / 2, len, w, 4);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(len - 6, -w * 0.3, 3, w * 0.6);

    ctx.fillStyle = `rgba(255,255,255,${0.12 + Math.sin(time * 3) * 0.06})`;
    ctx.fillRect(6, -w * 0.35, len * 0.4, w * 0.7);

    if (muzzleFlash > 0) {
      const flashIntensity = muzzleFlash * 4;
      const flashLen = 20 + muzzleFlash * 40;

      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 30;

      const flashGrad = ctx.createRadialGradient(len, 0, 0, len, 0, flashLen);
      flashGrad.addColorStop(0, `rgba(255,255,255,${flashIntensity})`);
      flashGrad.addColorStop(0.2, `rgba(255,200,100,${flashIntensity * 0.7})`);
      flashGrad.addColorStop(1, "rgba(255,200,100,0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(len, 0, flashLen, w * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.fillStyle = `rgba(255,255,255,${flashIntensity * 0.9})`;
      ctx.beginPath();
      ctx.arc(len + 6, 0, 4 + muzzleFlash * 12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderCenterGlow(ctx: CanvasRenderingContext2D, time: number): void {
    const pulse = 0.12 + Math.sin(time * 2) * 0.04;

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
    grad.addColorStop(0, `rgba(108, 92, 231, ${pulse})`);
    grad.addColorStop(0.4, `rgba(72, 52, 212, ${pulse * 0.5})`);
    grad.addColorStop(1, "rgba(108, 92, 231, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.fill();
  }
}
