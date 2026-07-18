import type { RawLandmark, HandData } from "@/types/landmarks";

export interface SmoothingConfig {
  positionAlpha: number;
  confidenceThreshold: number;
  lostTrackingGraceMs: number;
}

export const DEFAULT_SMOOTHING_CONFIG: SmoothingConfig = {
  positionAlpha: 0.5,
  confidenceThreshold: 0.5,
  lostTrackingGraceMs: 500,
};

export class LandmarkSmoother {
  private previous: RawLandmark[] | null = null;
  private lastUpdateTime: number = 0;
  private config: SmoothingConfig;

  constructor(config: Partial<SmoothingConfig> = {}) {
    this.config = { ...DEFAULT_SMOOTHING_CONFIG, ...config };
  }

  reset(): void {
    this.previous = null;
    this.lastUpdateTime = 0;
  }

  smooth(data: HandData | null, now: number): HandData | null {
    if (!data || data.confidence < this.config.confidenceThreshold) {
      if (
        this.previous &&
        now - this.lastUpdateTime < this.config.lostTrackingGraceMs
      ) {
        return {
          landmarks: this.previous,
          handedness: "unknown",
          confidence: 0,
        };
      }
      this.previous = null;
      return null;
    }

    if (!this.previous || this.previous.length !== data.landmarks.length) {
      this.previous = data.landmarks.map((l) => ({ ...l }));
      this.lastUpdateTime = now;
      return data;
    }

    const alpha = this.config.positionAlpha;
    const smoothed: RawLandmark[] = data.landmarks.map((raw, i) => {
      const prev = this.previous![i];
      return {
        x: prev.x + alpha * (raw.x - prev.x),
        y: prev.y + alpha * (raw.y - prev.y),
        z: prev.z + alpha * (raw.z - prev.z),
        visibility: raw.visibility,
      };
    });

    this.previous = smoothed;
    this.lastUpdateTime = now;

    return { landmarks: smoothed, handedness: data.handedness, confidence: data.confidence };
  }
}
