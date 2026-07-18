import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCalibration } from "@/hooks/useCalibration";

function makeHandData(confidence = 0.9, xOff = 0, yOff = 0) {
  const landmarks = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5 + xOff + i * 0.01,
    y: 0.5 + yOff + i * 0.01,
    z: 0,
    visibility: 0.9,
  }));
  return { landmarks, handedness: "Right", confidence };
}

describe("useCalibration", () => {
  it("starts in waiting phase with null handData", () => {
    const { result } = renderHook(() => useCalibration(null));
    expect(result.current.state.phase).toBe("waiting");
    expect(result.current.state.confidence).toBe(0);
    expect(result.current.state.stabilityProgress).toBe(0);
    expect(result.current.state.message).toBe("No hand detected");
  });

  it("transitions to detecting when handData arrives", () => {
    const handData = makeHandData(0.8);
    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd, { stabilityWindow: 5, stabilityDuration: 2000, stabilityThreshold: 2 }),
      { initialProps: { hd: null } },
    );

    expect(result.current.state.phase).toBe("waiting");

    act(() => {
      rerender({ hd: handData });
    });

    expect(result.current.state.phase).toBe("detecting");
    expect(result.current.state.confidence).toBe(0.8);
  });

  it("remains in waiting with low confidence handData", () => {
    const lowConfData = makeHandData(0.3);
    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd, { confidenceThreshold: 0.5 }),
      { initialProps: { hd: null } },
    );

    act(() => {
      rerender({ hd: lowConfData });
    });

    expect(result.current.state.phase).toBe("waiting");
    expect(result.current.state.confidence).toBe(0.3);
  });

  it("transitions to steady and then calibrated after stability duration", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd, {
        stabilityWindow: 5,
        stabilityDuration: 1000,
        stabilityThreshold: 2,
      }),
      { initialProps: { hd: null as ReturnType<typeof makeHandData> | null } },
    );

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(50);
        rerender({ hd: makeHandData(0.9) });
      });
    }
    expect(result.current.state.phase).toBe("steady");

    for (let i = 0; i < 25; i++) {
      act(() => {
        vi.advanceTimersByTime(50);
        rerender({ hd: makeHandData(0.9) });
      });
    }
    expect(result.current.state.phase).toBe("calibrated");
    expect(result.current.state.stabilityProgress).toBe(1);

    vi.useRealTimers();
  });

  it("resets to detecting when hand moves during steady phase", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd, {
        stabilityWindow: 5,
        stabilityDuration: 2000,
        stabilityThreshold: 0.01,
      }),
      { initialProps: { hd: null as ReturnType<typeof makeHandData> | null } },
    );

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(33);
        rerender({ hd: makeHandData(0.9) });
      });
    }

    expect(result.current.state.phase).toBe("steady");

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(33);
        rerender({ hd: makeHandData(0.9, 0.05 * (i + 1), 0.05 * (i + 1)) });
      });
    }

    expect(result.current.state.phase).toBe("detecting");
    expect(result.current.state.stabilityProgress).toBe(0);
    expect(result.current.state.confidence).toBe(0.9);

    vi.useRealTimers();
  });

  it("returns to waiting when hand leaves frame", () => {
    const handData = makeHandData(0.8);
    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd, { stabilityWindow: 5 }),
      { initialProps: { hd: null as ReturnType<typeof makeHandData> | null } },
    );

    act(() => {
      rerender({ hd: handData });
    });
    expect(result.current.state.phase).toBe("detecting");

    act(() => {
      rerender({ hd: null });
    });
    expect(result.current.state.phase).toBe("waiting");
    expect(result.current.state.stabilityProgress).toBe(0);
  });

  it("can be reset via reset callback", () => {
    const handData = makeHandData(0.8);
    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd),
      { initialProps: { hd: null } },
    );

    act(() => {
      rerender({ hd: handData });
    });
    expect(result.current.state.phase).toBe("detecting");

    act(() => {
      result.current.reset();
    });
    expect(result.current.state.phase).toBe("waiting");
    expect(result.current.state.confidence).toBe(0);
    expect(result.current.state.stabilityProgress).toBe(0);
  });

  it("shows confidence below threshold when hand has low confidence", () => {
    const lowConfData = makeHandData(0.4);
    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd, { confidenceThreshold: 0.5 }),
      { initialProps: { hd: null } },
    );

    act(() => {
      rerender({ hd: lowConfData });
    });

    expect(result.current.state.confidence).toBe(0.4);
    expect(result.current.state.phase).toBe("waiting");
  });

  it("renders stability progress correctly", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ hd }) => useCalibration(hd, {
        stabilityWindow: 5,
        stabilityDuration: 1000,
        stabilityThreshold: 2,
      }),
      { initialProps: { hd: null as ReturnType<typeof makeHandData> | null } },
    );

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(50);
        rerender({ hd: makeHandData(0.9) });
      });
    }
    expect(result.current.state.phase).toBe("steady");

    act(() => {
      vi.advanceTimersByTime(50);
      rerender({ hd: makeHandData(0.9) });
    });
    expect(result.current.state.stabilityProgress).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(500);
      rerender({ hd: makeHandData(0.9) });
    });
    expect(result.current.state.stabilityProgress).toBeGreaterThan(0.5);

    vi.useRealTimers();
  });
});
