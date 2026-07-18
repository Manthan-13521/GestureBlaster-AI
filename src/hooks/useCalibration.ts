"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { HandData, RawLandmark } from "@/types/landmarks";
import type { CalibrationPhase, CalibrationState } from "@/types/calibration";
import { getCalibrationMessage } from "@/types/calibration";

const STABILITY_WINDOW = 30;
const STABILITY_DURATION = 2000;
const STABILITY_THRESHOLD = 0.02;
const CONFIDENCE_THRESHOLD = 0.5;

interface UseCalibrationOptions {
  stabilityWindow?: number;
  stabilityDuration?: number;
  stabilityThreshold?: number;
  confidenceThreshold?: number;
}

function computeCentroid(landmarks: RawLandmark[]): { x: number; y: number } {
  let sx = 0;
  let sy = 0;
  for (const lm of landmarks) {
    sx += lm.x;
    sy += lm.y;
  }
  return { x: sx / landmarks.length, y: sy / landmarks.length };
}

function computeMaxMovement(history: { x: number; y: number }[]): number {
  if (history.length < 2) return Infinity;
  let maxDx = 0;
  let maxDy = 0;
  for (let i = 1; i < history.length; i++) {
    const dx = Math.abs(history[i].x - history[i - 1].x);
    const dy = Math.abs(history[i].y - history[i - 1].y);
    if (dx > maxDx) maxDx = dx;
    if (dy > maxDy) maxDy = dy;
  }
  return Math.max(maxDx, maxDy);
}

function computeAvgVisibility(landmarks: RawLandmark[]): number {
  let total = 0;
  for (const lm of landmarks) {
    total += lm.visibility;
  }
  return total / landmarks.length;
}

export function useCalibration(
  handData: HandData | null,
  options: UseCalibrationOptions = {},
) {
  const {
    stabilityWindow = STABILITY_WINDOW,
    stabilityDuration = STABILITY_DURATION,
    stabilityThreshold = STABILITY_THRESHOLD,
    confidenceThreshold = CONFIDENCE_THRESHOLD,
  } = options;

  const [phase, setPhase] = useState<CalibrationPhase>("waiting");
  const [confidence, setConfidence] = useState(0);
  const [stabilityProgress, setStabilityProgress] = useState(0);
  const [visibility, setVisibility] = useState(0);

  const historyRef = useRef<{ x: number; y: number }[]>([]);
  const stabilityStartRef = useRef<number | null>(null);
  const phaseRef = useRef<CalibrationPhase>("waiting");

  const reset = useCallback(() => {
    historyRef.current = [];
    stabilityStartRef.current = null;
    phaseRef.current = "waiting";
    setPhase("waiting");
    setStabilityProgress(0);
    setConfidence(0);
    setVisibility(0);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const now = performance.now();

    if (!handData || handData.confidence < confidenceThreshold) {
      historyRef.current = [];
      stabilityStartRef.current = null;
      setConfidence(handData?.confidence ?? 0);
      setVisibility(0);
      setStabilityProgress(0);
      if (phaseRef.current !== "waiting") {
        phaseRef.current = "waiting";
        setPhase("waiting");
      }
      return;
    }

    setConfidence(handData.confidence);
    setVisibility(computeAvgVisibility(handData.landmarks));

    const centroid = computeCentroid(handData.landmarks);
    historyRef.current.push(centroid);
    if (historyRef.current.length > stabilityWindow) {
      historyRef.current.shift();
    }

    if (historyRef.current.length < stabilityWindow) {
      if (phaseRef.current !== "detecting") {
        phaseRef.current = "detecting";
        setPhase("detecting");
      }
      return;
    }

    const maxMovement = computeMaxMovement(historyRef.current);
    const isStable = maxMovement < stabilityThreshold;

    if (isStable) {
      if (stabilityStartRef.current === null) {
        stabilityStartRef.current = now;
      }

      const elapsed = now - stabilityStartRef.current;
      const pct = Math.min(elapsed / stabilityDuration, 1);
      setStabilityProgress(pct);

      if (elapsed >= stabilityDuration) {
        if (phaseRef.current !== "calibrated") {
          phaseRef.current = "calibrated";
          setPhase("calibrated");
        }
      } else {
        if (phaseRef.current !== "steady") {
          phaseRef.current = "steady";
          setPhase("steady");
        }
      }
    } else {
      stabilityStartRef.current = null;
      setStabilityProgress(0);
      if (phaseRef.current !== "detecting") {
        phaseRef.current = "detecting";
        setPhase("detecting");
      }
    }
  }, [handData, stabilityWindow, stabilityDuration, stabilityThreshold, confidenceThreshold]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const state: CalibrationState = {
    phase,
    confidence,
    stabilityProgress,
    visibility,
    message: getCalibrationMessage(phase),
  };

  return { state, reset };
}
