import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import type { HandData, RawLandmark } from "@/types/landmarks";

export type HandTrackerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export interface HandTrackerConfig {
  modelUrl?: string;
  numHands: number;
  minDetectionConfidence: number;
  wasmPath?: string;
}

const DEFAULT_WASM_PATH = "/wasm";

const DEFAULT_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export type HandTrackerCallback = (data: HandData | null) => void;

export class HandTracker {
  private landmarker: HandLandmarker | null = null;
  private status: HandTrackerStatus = "idle";
  private config: HandTrackerConfig;
  private lastTimestamp: number = 0;

  constructor(config: Partial<HandTrackerConfig> = {}) {
    this.config = {
      modelUrl: DEFAULT_MODEL_URL,
      numHands: 1,
      minDetectionConfidence: 0.5,
      wasmPath: DEFAULT_WASM_PATH,
      ...config,
    };
  }

  getStatus(): HandTrackerStatus {
    return this.status;
  }

  isReady(): boolean {
    return this.status === "ready" && this.landmarker !== null;
  }

  async initialize(): Promise<void> {
    this.status = "loading";

    try {
      const wasmPath = this.config.wasmPath || DEFAULT_WASM_PATH;

      const vision = await FilesetResolver.forVisionTasks(wasmPath);

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: this.config.modelUrl || DEFAULT_MODEL_URL,
        },
        runningMode: "VIDEO",
        numHands: this.config.numHands,
        minHandDetectionConfidence: this.config.minDetectionConfidence,
        minTrackingConfidence: 0.5,
      });

      this.status = "ready";
    } catch (err) {
      this.status = "error";
      this.landmarker = null;
      throw err;
    }
  }

  detect(video: HTMLVideoElement, timestamp: number): HandData | null {
    if (!this.landmarker || this.status !== "ready") return null;
    if (video.readyState < 2) return null;

    try {
      const result: HandLandmarkerResult = this.landmarker.detectForVideo(
        video,
        timestamp,
      );

      if (!result.landmarks || result.landmarks.length === 0) {
        return null;
      }

      const hand = result.landmarks[0];
      const handedness =
        result.handedness?.[0]?.[0]?.categoryName || "unknown";
      const confidence = result.handedness?.[0]?.[0]?.score ?? 0;

      const landmarks: RawLandmark[] = hand.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 1,
      }));

      return { landmarks, handedness, confidence };
    } catch {
      return null;
    }
  }

  close(): void {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.status = "idle";
  }
}
