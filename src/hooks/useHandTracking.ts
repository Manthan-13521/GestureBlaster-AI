"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { HandTracker } from "@/input/hand-tracker";
import { LandmarkSmoother } from "@/input/landmark-smoother";
import type { HandTrackerStatus } from "@/input/hand-tracker";
import type { HandData } from "@/types/landmarks";

interface UseHandTrackingReturn {
  status: HandTrackerStatus;
  handData: HandData | null;
  start: (video: HTMLVideoElement) => void;
  stop: () => void;
}

export function useHandTracking(): UseHandTrackingReturn {
  const [status, setStatus] = useState<HandTrackerStatus>("idle");
  const [handData, setHandData] = useState<HandData | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const smootherRef = useRef<LandmarkSmoother | null>(null);
  const rafRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const runningRef = useRef(false);

  const start = useCallback(async (video: HTMLVideoElement) => {
    if (trackerRef.current) return;

    videoRef.current = video;
    const tracker = new HandTracker();
    trackerRef.current = tracker;
    smootherRef.current = new LandmarkSmoother();

    setStatus("loading");

    try {
      await tracker.initialize();
      setStatus("ready");
      runningRef.current = true;

      const loop = () => {
        if (!runningRef.current) return;
        const now = performance.now();
        const data = tracker.detect(video, now);
        const smoothed = smootherRef.current?.smooth(data, now) ?? data;
        setHandData(smoothed);
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setStatus("error");
      trackerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (trackerRef.current) {
      trackerRef.current.close();
      trackerRef.current = null;
    }
    smootherRef.current = null;
    videoRef.current = null;
    setHandData(null);
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (trackerRef.current) {
        trackerRef.current.close();
      }
    };
  }, []);

  return { status, handData, start, stop };
}
