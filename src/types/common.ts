export interface Vector2 {
  x: number;
  y: number;
}

export type GameScreenState =
  | "permission"
  | "explaining"
  | "requesting"
  | "calibrating"
  | "camera-error"
  | "playing";
