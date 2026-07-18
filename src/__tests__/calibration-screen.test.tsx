import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CalibrationScreen from "@/components/calibration/CalibrationScreen";
import type { CalibrationState } from "@/types/calibration";

vi.mock("@/components/calibration/HandWireframe", () => ({
  default: () => null,
}));

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  });
});

function makeHandData(confidence = 0.9, variations = false) {
  const landmarks = Array.from({ length: 21 }, (_, i) => ({
    x: variations ? 0.5 + Math.random() * 0.02 : 0.5 + i * 0.01,
    y: variations ? 0.5 + Math.random() * 0.02 : 0.5 + i * 0.01,
    z: 0,
    visibility: 0.9,
  }));
  return { landmarks, handedness: "Right", confidence };
}

function makeState(overrides: Partial<CalibrationState> = {}): CalibrationState {
  return {
    phase: "waiting",
    confidence: 0,
    stabilityProgress: 0,
    visibility: 0,
    message: "No hand detected",
    ...overrides,
  };
}

describe("CalibrationScreen", () => {
  const onCalibrated = vi.fn();
  const onSkipToMouse = vi.fn();
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows no-hand overlay when handData is null", () => {
    render(
      <CalibrationScreen
        calibrationState={makeState()}
        handData={null}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Position your hand in front of the camera")).toBeDefined();
    expect(screen.getAllByText("No hand detected").length).toBe(2);
  });

  it("shows waiting message when handData is null in waiting phase", () => {
    render(
      <CalibrationScreen
        calibrationState={makeState({ phase: "waiting", message: "No hand detected" })}
        handData={null}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getAllByText("No hand detected").length).toBeGreaterThanOrEqual(1);
  });

  it("shows detecting message when hand is visible but not steady", () => {
    const handData = makeHandData(0.7);
    render(
      <CalibrationScreen
        calibrationState={makeState({
          phase: "detecting",
          confidence: 0.7,
          visibility: 0.85,
          message: "Hold your hand steady",
        })}
        handData={handData}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Hold your hand steady")).toBeDefined();
    expect(screen.getByText("Keep your hand still to calibrate")).toBeDefined();
  });

  it("shows steady message with stability progress during calibration", () => {
    const handData = makeHandData(0.85);
    render(
      <CalibrationScreen
        calibrationState={makeState({
          phase: "steady",
          confidence: 0.85,
          stabilityProgress: 0.5,
          visibility: 0.9,
          message: "Calibrating\u2026 hold steady",
        })}
        handData={handData}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getByText(/Calibrating/)).toBeDefined();
    expect(screen.getByText("50%")).toBeDefined();
  });

  it("shows calibrated overlay and triggers onCalibrated after delay", async () => {
    vi.useFakeTimers();
    const handData = makeHandData(0.95);
    render(
      <CalibrationScreen
        calibrationState={makeState({
          phase: "calibrated",
          confidence: 0.95,
          stabilityProgress: 1,
          visibility: 0.95,
          message: "Calibration complete",
        })}
        handData={handData}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Calibration Complete")).toBeDefined();
    expect(screen.getByText("Calibration complete")).toBeDefined();

    expect(onCalibrated).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1200);
    expect(onCalibrated).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("renders confidence bar with correct value", () => {
    const handData = makeHandData(0.7);
    render(
      <CalibrationScreen
        calibrationState={makeState({
          phase: "detecting",
          confidence: 0.7,
          visibility: 0.8,
          message: "Hold your hand steady",
        })}
        handData={handData}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("70%")).toBeDefined();
  });

  it("renders visibility bar", () => {
    const handData = makeHandData(0.8);
    render(
      <CalibrationScreen
        calibrationState={makeState({
          phase: "detecting",
          confidence: 0.8,
          visibility: 0.75,
          message: "Hold your hand steady",
        })}
        handData={handData}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("75%")).toBeDefined();
  });

  it("calls onSkipToMouse when skip button is clicked", () => {
    render(
      <CalibrationScreen
        calibrationState={makeState()}
        handData={null}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    screen.getByText("Skip to Mouse Controls").click();
    expect(onSkipToMouse).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when back button is clicked", () => {
    render(
      <CalibrationScreen
        calibrationState={makeState()}
        handData={null}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    screen.getByText("← Back").click();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows low confidence color for bars when confidence is low", () => {
    const handData = makeHandData(0.3);
    render(
      <CalibrationScreen
        calibrationState={makeState({
          phase: "waiting",
          confidence: 0.3,
          visibility: 0.4,
          message: "No hand detected",
        })}
        handData={handData}
        onCalibrated={onCalibrated}
        onSkipToMouse={onSkipToMouse}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("30%")).toBeDefined();
  });
});
