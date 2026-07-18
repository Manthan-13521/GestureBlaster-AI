export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unsupported"
  | "error";

export interface CameraConfig {
  width: number;
  height: number;
  facingMode: "user" | "environment";
}

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  width: 640,
  height: 480,
  facingMode: "user",
};
