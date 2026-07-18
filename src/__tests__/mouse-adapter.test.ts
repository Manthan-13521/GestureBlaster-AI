import { describe, it, expect, beforeEach } from "vitest";
import { MouseAdapter } from "@/input/mouse-adapter";

describe("MouseAdapter", () => {
  let adapter: MouseAdapter;
  let element: HTMLElement;

  beforeEach(() => {
    adapter = new MouseAdapter();
    element = document.createElement("div");
    adapter.attach(element);
  });

  it("reports idle state initially", () => {
    const input = adapter.getInput();
    expect(input.isAiming).toBe(false);
    expect(input.isPinching).toBe(false);
    expect(input.origin).toBeNull();
    expect(input.released).toBe(false);
    expect(input.source).toBe("mouse");
    expect(input.handConfidence).toBe(1);
  });

  it("detects mousedown as pinching", () => {
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 500, clientY: 400 }));
    const input = adapter.getInput();
    expect(input.isAiming).toBe(true);
    expect(input.isPinching).toBe(true);
    expect(input.origin).toEqual({ x: 500, y: 400 });
    expect(input.currentPosition).toEqual({ x: 500, y: 400 });
  });

  it("tracks mouse movement after mousedown", () => {
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 500, clientY: 400 }));
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 400, clientY: 400 }));
    const input = adapter.getInput();
    expect(input.currentPosition).toEqual({ x: 400, y: 400 });
    expect(input.pullVector.x).toBe(100);
    expect(input.pullVector.y).toBe(0);
  });

  it("detects mouseup as released", () => {
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 500, clientY: 400 }));
    adapter.getInput();
    window.dispatchEvent(new MouseEvent("mouseup"));
    const input = adapter.getInput();
    expect(input.released).toBe(true);
    expect(input.isPinching).toBe(false);
  });

  it("released is only true for one frame", () => {
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 500, clientY: 400 }));
    adapter.getInput();
    window.dispatchEvent(new MouseEvent("mouseup"));
    adapter.getInput(); // consume released
    const input = adapter.getInput();
    expect(input.released).toBe(false);
  });

  it("calculates charge based on pull distance", () => {
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 500, clientY: 400 }));
    adapter.getInput();
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 300, clientY: 400 }));
    const input = adapter.getInput();
    expect(input.charge).toBeGreaterThan(0);
    expect(input.charge).toBeLessThanOrEqual(1);
  });

  it("detaches and stops responding", () => {
    adapter.detach();
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 500, clientY: 400 }));
    const input = adapter.getInput();
    expect(input.isAiming).toBe(false);
  });

  it("resets state on reset", () => {
    element.dispatchEvent(new MouseEvent("mousedown", { clientX: 500, clientY: 400 }));
    adapter.reset();
    const input = adapter.getInput();
    expect(input.isAiming).toBe(false);
    expect(input.origin).toBeNull();
  });
});
