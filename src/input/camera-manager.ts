import type { CameraStatus, CameraConfig } from "@/types/camera";

export type CameraStatusCallback = (status: CameraStatus, error?: string) => void;

export class CameraManager {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private status: CameraStatus = "idle";
  private config: CameraConfig;

  constructor(config: CameraConfig) {
    this.config = config;
  }

  getStatus(): CameraStatus {
    return this.status;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  getVideo(): HTMLVideoElement | null {
    return this.video;
  }

  isSupported(): boolean {
    return !!(
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    );
  }

  async requestAccess(
    statusCallback?: CameraStatusCallback,
  ): Promise<HTMLVideoElement> {
    if (!this.isSupported()) {
      this.status = "unsupported";
      statusCallback?.("unsupported");
      throw new Error("Camera not supported in this browser");
    }

    this.status = "requesting";
    statusCallback?.("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: this.config.width },
          height: { ideal: this.config.height },
          facingMode: this.config.facingMode,
        },
        audio: false,
      });

      this.stream = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("autoplay", "");
      video.style.display = "none";

      await video.play();

      this.video = video;
      this.status = "ready";
      statusCallback?.("ready");

      return video;
    } catch (err) {
      const error = err as DOMException;

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        this.status = "denied";
        statusCallback?.("denied", "Camera permission denied");
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        this.status = "unsupported";
        statusCallback?.("unsupported", "No camera found");
      } else {
        this.status = "error";
        statusCallback?.("error", error.message || "Camera error");
      }

      throw error;
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video.remove();
      this.video = null;
    }

    this.status = "idle";
  }
}
