export class ScreenShake {
  private amplitude: number = 0;
  private decayRate: number = 8;
  private dirAngle: number = 0;
  private useDirection: boolean = false;
  private perpAmplitude: number = 0;

  trigger(intensity: number = 0.5): void {
    this.amplitude = Math.min(1, this.amplitude + intensity);
    this.useDirection = false;
  }

  triggerDirectional(intensity: number, angle: number, frequency?: number): void {
    this.amplitude = Math.min(1, this.amplitude + intensity);
    this.dirAngle = angle;
    this.useDirection = true;
    this.decayRate = frequency ?? 8;
  }

  update(dt: number): void {
    if (this.amplitude > 0) {
      this.amplitude *= Math.exp(-this.decayRate * dt);
      if (this.amplitude < 0.001) this.amplitude = 0;
    }
  }

  getOffset(): { x: number; y: number } {
    if (this.amplitude <= 0) return { x: 0, y: 0 };
    const mag = this.amplitude * 8;
    if (this.useDirection) {
      const perpAngle = this.dirAngle + Math.PI / 2;
      const forward = (Math.random() * 2 - 1) * mag;
      const perp = (Math.random() * 2 - 1) * mag * 0.4;
      return {
        x: Math.cos(this.dirAngle) * forward + Math.cos(perpAngle) * perp,
        y: Math.sin(this.dirAngle) * forward + Math.sin(perpAngle) * perp,
      };
    }
    return {
      x: (Math.random() * 2 - 1) * mag,
      y: (Math.random() * 2 - 1) * mag,
    };
  }

  get intensity(): number {
    return this.amplitude;
  }

  set intensity(v: number) {
    this.amplitude = v;
  }
}
