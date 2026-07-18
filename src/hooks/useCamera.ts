"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { CameraManager } from "@/input/camera-manager";
import type { CameraStatus, CameraConfig } from "@/types/camera";
import { DEFAULT_CAMERA_CONFIG } from "@/types/camera";

interface UseCameraReturn {
  status: CameraStatus;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  error: string | null;
  requestAccess: () => Promise<void>;
  stop: () => void;
}

export function useCamera(config: Partial<CameraConfig> = {}): UseCameraReturn {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const managerRef = useRef<CameraManager | null>(null);

  const mergedConfig = useMemo<CameraConfig>(
    () => ({ ...DEFAULT_CAMERA_CONFIG, ...config }),
    [config],
  );

  const requestAccess = useCallback(async () => {
    if (!managerRef.current) {
      managerRef.current = new CameraManager(mergedConfig);
    }

    if (!managerRef.current.isSupported()) {
      setStatus("unsupported");
      setError("Camera not supported in this browser");
      return;
    }

    setStatus("requesting");
    setError(null);

    try {
      const manager = managerRef.current;
      const video = await manager.requestAccess((s, err) => {
        setStatus(s);
        if (err) setError(err);
      });

      videoRef.current = video;
      setStatus("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown camera error";

      if (message.includes("denied") || message.includes("permission")) {
        setStatus("denied");
        setError("Camera permission denied");
      } else if (message.includes("not found") || message.includes("NotFound")) {
        setStatus("unsupported");
        setError("No camera found");
      } else {
        setStatus("error");
        setError(message);
      }
    }
  }, [mergedConfig]);

  const stop = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.stop();
    }
    videoRef.current = null;
    setStatus("idle");
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.stop();
      }
    };
  }, []);

  return { status, videoRef, error, requestAccess, stop };
}
