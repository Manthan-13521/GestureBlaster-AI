import { describe, it, expect } from "vitest";
import { LandmarkSmoother } from "@/input/landmark-smoother";
import type { HandData } from "@/types/landmarks";

function makeHandData(x: number, y: number, confidence = 0.9): HandData {
  return {
    landmarks: [
      { x, y, z: 0, visibility: 1 },
      { x: x + 0.01, y: y + 0.01, z: 0, visibility: 1 },
      { x: x + 0.02, y: y + 0.02, z: 0, visibility: 1 },
    ],
    handedness: "Right",
    confidence,
  };
}

describe("LandmarkSmoother", () => {
  it("returns input data on first call", () => {
    const smoother = new LandmarkSmoother({ positionAlpha: 0.5 });
    const data = makeHandData(0.5, 0.5);
    const result = smoother.smooth(data, 0);
    expect(result).not.toBeNull();
    expect(result!.landmarks[0].x).toBe(0.5);
    expect(result!.landmarks[0].y).toBe(0.5);
  });

  it("smooths landmarks using EMA", () => {
    const smoother = new LandmarkSmoother({ positionAlpha: 0.5 });
    smoother.smooth(makeHandData(0.5, 0.5), 0);
    const result = smoother.smooth(makeHandData(0.7, 0.7), 100);
    expect(result).not.toBeNull();
    expect(result!.landmarks[0].x).toBeCloseTo(0.6, 5);
    expect(result!.landmarks[0].y).toBeCloseTo(0.6, 5);
  });

  it("returns null when confidence is below threshold", () => {
    const smoother = new LandmarkSmoother({
      positionAlpha: 0.5,
      confidenceThreshold: 0.5,
    });
    const data = makeHandData(0.5, 0.5, 0.3);
    const result = smoother.smooth(data, 0);
    expect(result).toBeNull();
  });

  it("returns last known position during grace period", () => {
    const smoother = new LandmarkSmoother({
      positionAlpha: 0.5,
      lostTrackingGraceMs: 500,
    });
    smoother.smooth(makeHandData(0.5, 0.5), 0);
    const result = smoother.smooth(null, 100);
    expect(result).not.toBeNull();
    expect(result!.landmarks[0].x).toBe(0.5);
  });

  it("returns null after grace period expires", () => {
    const smoother = new LandmarkSmoother({
      positionAlpha: 0.5,
      lostTrackingGraceMs: 100,
    });
    smoother.smooth(makeHandData(0.5, 0.5), 0);
    const result = smoother.smooth(null, 500);
    expect(result).toBeNull();
  });

  it("resets state when reset is called", () => {
    const smoother = new LandmarkSmoother({ positionAlpha: 0.5 });
    smoother.smooth(makeHandData(0.5, 0.5), 0);
    smoother.reset();
    const result = smoother.smooth(makeHandData(0.7, 0.7), 100);
    expect(result!.landmarks[0].x).toBe(0.7);
  });
});
