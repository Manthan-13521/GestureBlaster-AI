import { describe, it, expect, beforeEach } from "vitest";
import { TouchAdapter } from "@/input/touch-adapter";

function createTouchEvent(type: string, id: number, x: number, y: number): TouchEvent {
  const touch = { identifier: id, clientX: x, clientY: y } as Touch;
  return new TouchEvent(type, {
    changedTouches: [touch] as unknown as TouchList,
    touches: [] as unknown as TouchList,
  });
}

describe("TouchAdapter", () => {
  let adapter: TouchAdapter;
  let element: HTMLElement;

  beforeEach(() => {
    adapter = new TouchAdapter();
    element = document.createElement("div");
    adapter.attach(element);
  });

  it("reports idle state initially", () => {
    const input = adapter.getInput();
    expect(input.isAiming).toBe(false);
    expect(input.isPinching).toBe(false);
    expect(input.origin).toBeNull();
    expect(input.released).toBe(false);
    expect(input.source).toBe("touch");
  });

  it("detects touchstart as pinching", () => {
    element.dispatchEvent(createTouchEvent("touchstart", 1, 500, 400));
    const input = adapter.getInput();
    expect(input.isAiming).toBe(true);
    expect(input.isPinching).toBe(true);
    expect(input.origin).toEqual({ x: 500, y: 400 });
  });

  it("tracks touch movement", () => {
    element.dispatchEvent(createTouchEvent("touchstart", 1, 500, 400));
    adapter.getInput();
    element.dispatchEvent(createTouchEvent("touchmove", 1, 400, 400));
    const input = adapter.getInput();
    expect(input.currentPosition).toEqual({ x: 400, y: 400 });
    expect(input.pullVector.x).toBe(100);
  });

  it("detects touchend as released", () => {
    element.dispatchEvent(createTouchEvent("touchstart", 1, 500, 400));
    adapter.getInput();
    element.dispatchEvent(createTouchEvent("touchend", 1, 400, 400));
    const input = adapter.getInput();
    expect(input.released).toBe(true);
    expect(input.isPinching).toBe(false);
  });

  it("detects touchcancel as released", () => {
    element.dispatchEvent(createTouchEvent("touchstart", 1, 500, 400));
    adapter.getInput();
    element.dispatchEvent(createTouchEvent("touchcancel", 1, 400, 400));
    const input = adapter.getInput();
    expect(input.released).toBe(true);
  });

  it("released is only true for one frame", () => {
    element.dispatchEvent(createTouchEvent("touchstart", 1, 500, 400));
    adapter.getInput();
    element.dispatchEvent(createTouchEvent("touchend", 1, 400, 400));
    adapter.getInput();
    const input = adapter.getInput();
    expect(input.released).toBe(false);
  });

  it("detaches and stops responding", () => {
    adapter.detach();
    element.dispatchEvent(createTouchEvent("touchstart", 1, 500, 400));
    const input = adapter.getInput();
    expect(input.isAiming).toBe(false);
  });

  it("tracks charge based on pull distance", () => {
    element.dispatchEvent(createTouchEvent("touchstart", 1, 500, 400));
    adapter.getInput();
    element.dispatchEvent(createTouchEvent("touchmove", 1, 300, 400));
    const input = adapter.getInput();
    expect(input.charge).toBeGreaterThan(0);
  });
});
