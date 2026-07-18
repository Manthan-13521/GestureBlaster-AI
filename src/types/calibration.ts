export type CalibrationPhase =
  | "waiting"
  | "detecting"
  | "steady"
  | "calibrated";

export interface CalibrationState {
  phase: CalibrationPhase;
  confidence: number;
  stabilityProgress: number;
  visibility: number;
  message: string;
}

const MESSAGES: Record<CalibrationPhase, string> = {
  waiting: "No hand detected",
  detecting: "Hold your hand steady",
  steady: "Calibrating\u2026 hold steady",
  calibrated: "Calibration complete",
};

export function getCalibrationMessage(phase: CalibrationPhase): string {
  return MESSAGES[phase];
}
