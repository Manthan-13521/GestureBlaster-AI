import type { Vector2 } from "./common";

export interface AimInput {
  angle: number;
  isActive: boolean;
  confidence: number;
  source: "hand" | "mouse" | "touch";
  position: Vector2;
}
