import { describe, it, expect } from "vitest";
import { CoordinateMapper } from "@/input/coordinate-mapper";

describe("CoordinateMapper", () => {
  const camera4by3 = { width: 640, height: 480 };
  const viewport16by9 = { width: 1920, height: 1080 };
  const viewport9by16 = { width: 390, height: 844 };

  it("maps visible top of camera to viewport top edge (16:9)", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const result = mapper.mapToViewport(0.5, 0.125);
    expect(result.x).toBe(960);
    expect(result.y).toBeCloseTo(0, 0);
  });

  it("mirrors camera top-left — outside viewport due to cover crop (16:9)", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const result = mapper.mapToViewport(0, 0);
    expect(result.x).toBe(1920);
    expect(result.y).toBe(-180);
  });

  it("mirrors camera bottom-right — outside viewport due to cover crop (16:9)", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const result = mapper.mapToViewport(1, 1);
    expect(result.x).toBe(0);
    expect(result.y).toBe(1260);
  });

  it("maps camera center to viewport center (16:9)", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const result = mapper.mapToViewport(0.5, 0.5);
    expect(result.x).toBe(960);
    expect(result.y).toBe(540);
  });

  it("maps mirrored left edge to viewport right edge", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const result = mapper.mapToViewport(0, 0.5);
    expect(result.x).toBe(1920);
    expect(result.y).toBe(540);
  });

  it("maps mirrored right edge to viewport left edge", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const result = mapper.mapToViewport(1, 0.5);
    expect(result.x).toBe(0);
    expect(result.y).toBe(540);
  });

  it("handles portrait viewport (mobile) with mirroring", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport9by16);
    const result = mapper.mapToViewport(0.5, 0.5);
    expect(result.x).toBeCloseTo(195, 0);
    expect(result.y).toBeCloseTo(422, 0);
  });

  it("calculates cover cropping offset correctly (16:9)", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const region = (mapper as unknown as { getCoverVisibleRegion(): { offsetX: number; offsetY: number; scale: number } }).getCoverVisibleRegion();
    expect(region.offsetX).toBe(0);
    expect(region.offsetY).toBe(-180);
    expect(region.scale).toBe(3);
  });

  it("maps to canvas coordinates with mirror", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    const result = mapper.mapToCanvas(0.5, 0.5, 960, 540);
    expect(result.x).toBe(480);
    expect(result.y).toBe(270);
  });

  it("mirrors x coordinate correctly", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    expect(mapper.mirrorX(0)).toBe(1);
    expect(mapper.mirrorX(1)).toBe(0);
    expect(mapper.mirrorX(0.5)).toBe(0.5);
  });

  it("resizes viewport and recalculates", () => {
    const mapper = new CoordinateMapper(camera4by3, viewport16by9);
    mapper.resize({ width: 800, height: 600 });
    const result = mapper.mapToViewport(0.5, 0.5);
    expect(result.x).toBe(400);
    expect(result.y).toBe(300);
  });
});
