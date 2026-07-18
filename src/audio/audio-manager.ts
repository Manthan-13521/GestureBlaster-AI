export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;
  private chargeSubOsc: OscillatorNode | null = null;
  private chargeSubGain: GainNode | null = null;

  private chargeLfo: OscillatorNode | null = null;
  private chargeLfoGain: GainNode | null = null;

  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private ambientLfoGain: GainNode | null = null;

  private _volume: number = 1;
  private _muted: boolean = false;
  private static BASE_VOLUME = 0.15;

  private duckTimer: ReturnType<typeof setTimeout> | null = null;

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = AudioManager.BASE_VOLUME * this._volume;

        this.duckGain = this.ctx.createGain();
        this.duckGain.gain.value = 1;
        this.master.connect(this.duckGain);
        this.duckGain.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  get muted(): boolean {
    return this._muted;
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v));
    if (!this._muted && this.master) {
      this.master.gain.value = AudioManager.BASE_VOLUME * this._volume;
    }
  }

  toggleMute(): void {
    this._muted = !this._muted;
    if (this.master) {
      this.master.gain.value = this._muted
        ? 0
        : AudioManager.BASE_VOLUME * this._volume;
    }
  }

  private duck(duration: number = 0.2, amount: number = 0.4): void {
    const ctx = this.ctx;
    if (!ctx || !this.duckGain) return;
    if (this.duckTimer) clearTimeout(this.duckTimer);
    this.duckGain.gain.setTargetAtTime(amount, ctx.currentTime, 0.02);
    this.duckTimer = setTimeout(() => {
      if (this.duckGain && ctx) {
        this.duckGain.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
      }
    }, duration * 1000);
  }

  playPinchBlip(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    for (const freq of [300, 800]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    }

    this.playNoiseBurst(0.04, 0.06, ctx.currentTime);
  }

  private playNoiseBurst(
    duration: number,
    gain: number,
    when: number,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain, when);
    gainNode.gain.exponentialRampToValueAtTime(0.001, when + duration);
    source.connect(gainNode);
    gainNode.connect(this.master);
    source.start(when);
    source.stop(when + duration + 0.01);
  }

  startChargeRise(on: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    this.stopChargeRise();
    if (!on) return;

    this.chargeOsc = ctx.createOscillator();
    this.chargeGain = ctx.createGain();
    this.chargeOsc.type = "sine";
    this.chargeOsc.frequency.setValueAtTime(200, ctx.currentTime);
    this.chargeGain.gain.setValueAtTime(0.12, ctx.currentTime);
    this.chargeOsc.connect(this.chargeGain);
    this.chargeGain.connect(this.master);
    this.chargeOsc.start(ctx.currentTime);

    this.chargeSubOsc = ctx.createOscillator();
    this.chargeSubGain = ctx.createGain();
    this.chargeSubOsc.type = "triangle";
    this.chargeSubOsc.frequency.setValueAtTime(100, ctx.currentTime);
    this.chargeSubGain.gain.setValueAtTime(0.06, ctx.currentTime);
    this.chargeSubOsc.connect(this.chargeSubGain);
    this.chargeSubGain.connect(this.master);
    this.chargeSubOsc.start(ctx.currentTime);

    this.chargeLfo = ctx.createOscillator();
    this.chargeLfoGain = ctx.createGain();
    this.chargeLfo.frequency.value = 6;
    this.chargeLfoGain.gain.value = 8;
    this.chargeLfo.connect(this.chargeLfoGain);
    this.chargeLfoGain.connect(this.chargeOsc.detune);
    this.chargeLfo.start(ctx.currentTime);
  }

  setCharge(charge: number): void {
    if (!this.chargeOsc || !this.chargeSubOsc || !this.ctx) return;
    const freq = 200 + charge * 600;
    this.chargeOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    this.chargeSubOsc.frequency.setTargetAtTime(freq * 0.5, this.ctx.currentTime, 0.05);
    if (charge >= 1 && this.chargeGain && this.chargeSubGain) {
      this.chargeGain.gain.setTargetAtTime(0.22, this.ctx.currentTime, 0.02);
      this.chargeSubGain.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.02);
    }
  }

  stopChargeRise(): void {
    for (const osc of [this.chargeOsc, this.chargeSubOsc, this.chargeLfo]) {
      if (osc) {
        try { osc.stop(); } catch { /* already stopped */ }
        osc.disconnect();
      }
    }
    for (const gain of [this.chargeGain, this.chargeSubGain, this.chargeLfoGain]) {
      if (gain) {
        gain.disconnect();
      }
    }
    this.chargeOsc = null;
    this.chargeGain = null;
    this.chargeSubOsc = null;
    this.chargeSubGain = null;
    this.chargeLfo = null;
    this.chargeLfoGain = null;
  }

  playLaunchSweep(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    this.duck(0.15, 0.5);

    this.playNoiseBurst(0.03, 0.2, ctx.currentTime);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.02);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  playFullCharge(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 800;
    lfo.frequency.value = 16;
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.master);
    lfo.start(ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    lfo.stop(ctx.currentTime + 0.3);
  }

  playImpact(type: "stagger" | "defeat" = "stagger"): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const duration = type === "defeat" ? 0.15 : 0.08;

    this.playNoiseBurst(duration, 0.2, ctx.currentTime);

    if (type === "defeat") {
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.value = 60;
      subGain.gain.setValueAtTime(0.15, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      sub.connect(subGain);
      subGain.connect(this.master);
      sub.start(ctx.currentTime);
      sub.stop(ctx.currentTime + 0.2);
    }
  }

  playWispChime(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const freqs = [400, 600, 800];
    for (let i = 0; i < freqs.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freqs[i];
      const t = ctx.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0.12 - i * 0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 - i * 0.1);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.5 - i * 0.1);
    }
  }

  playLifeLost(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(40, ctx.currentTime);
    sub.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
    subGain.gain.setValueAtTime(0.1, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    sub.connect(subGain);
    subGain.connect(this.master);
    sub.start(ctx.currentTime);
    sub.stop(ctx.currentTime + 0.4);
  }

  playWaveTransition(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const notes = [300, 375, 450];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[i];
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  playGameOver(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const pairs: [number, number, number][] = [
      [200, 150, 0],
      [100, 80, 0.3],
    ];
    for (const [freq1, freq2, delay] of pairs) {
      for (let j = 0; j < 2; j++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = j === 0 ? "sawtooth" : "sine";
        osc.frequency.value = j === 0 ? freq1 : freq2;
        const t = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(t);
        osc.stop(t + 0.5);
      }
    }
  }

  playRestart(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  startWispAmbient(): void {
    this.stopWispAmbient();
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    this.ambientFilter = ctx.createBiquadFilter();
    this.ambientFilter.type = "bandpass";
    this.ambientFilter.frequency.value = 300;
    this.ambientFilter.Q.value = 2;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.04, ctx.currentTime);

    this.ambientOsc = ctx.createOscillator();
    this.ambientOsc.type = "sawtooth";
    this.ambientOsc.frequency.value = 60;
    this.ambientOsc.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.master);

    this.ambientLfo = ctx.createOscillator();
    this.ambientLfoGain = ctx.createGain();
    this.ambientLfo.frequency.value = 0.5;
    this.ambientLfoGain.gain.value = 40;
    this.ambientLfo.connect(this.ambientLfoGain);
    this.ambientLfoGain.connect(this.ambientFilter.frequency);
    this.ambientLfo.start(ctx.currentTime);

    this.ambientOsc.start(ctx.currentTime);
  }

  stopWispAmbient(): void {
    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); } catch { /* already stopped */ }
      this.ambientOsc.disconnect();
      this.ambientOsc = null;
    }
    if (this.ambientLfo) {
      try { this.ambientLfo.stop(); } catch { /* already stopped */ }
      this.ambientLfo.disconnect();
      this.ambientLfo = null;
    }
    if (this.ambientLfoGain) {
      this.ambientLfoGain.disconnect();
      this.ambientLfoGain = null;
    }
    if (this.ambientFilter) {
      this.ambientFilter.disconnect();
      this.ambientFilter = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }

  suspend(): void {
    this.stopChargeRise();
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend();
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  cleanup(): void {
    this.stopChargeRise();
    this.stopWispAmbient();
    if (this.duckTimer) clearTimeout(this.duckTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.master = null;
    this.duckGain = null;
  }
}
