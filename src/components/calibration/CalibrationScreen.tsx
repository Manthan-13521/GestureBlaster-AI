"use client";

import { useRef, useEffect, useState } from "react";
import type { CalibrationState } from "@/types/calibration";
import type { HandData } from "@/types/landmarks";
import HandWireframe from "./HandWireframe";

interface CalibrationScreenProps {
  calibrationState: CalibrationState;
  handData: HandData | null;
  onCalibrated: () => void;
  onSkipToMouse: () => void;
  onBack: () => void;
}

const PHASE_COLORS: Record<string, string> = {
  waiting: "#ff4060",
  detecting: "#ffaa00",
  steady: "#6c5ce7",
  calibrated: "#00f5d4",
};

const PHASE_ICONS: Record<string, string> = {
  waiting: "\u{1F590}",
  detecting: "\u{270B}",
  steady: "\u{23F3}",
  calibrated: "\u{2705}",
};

function StatusBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#6c6c80] w-24 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[#1a1a2e] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{
            width: `${Math.min(value * 100, 100)}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
      </div>
      <span className="font-mono text-[10px] text-[#6c6c80] w-8 text-right tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

export default function CalibrationScreen({
  calibrationState,
  handData,
  onCalibrated,
  onSkipToMouse,
  onBack,
}: CalibrationScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { phase, confidence, stabilityProgress, visibility, message } =
    calibrationState;
  const phaseColor = PHASE_COLORS[phase] ?? "#6c6c80";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase === "calibrated") {
      const timer = setTimeout(onCalibrated, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase, onCalibrated]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#08080e] overflow-hidden select-none touch-none flex flex-col"
    >
      <div className="absolute top-0 inset-x-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#48485a] hover:text-[#6c6c80] transition-colors duration-200 cursor-pointer px-3 py-2"
            aria-label="Back to main menu"
          >
            &larr; Back
          </button>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#48485a]">
            Hand Mode
          </span>
        </div>
      </div>

      <div className="relative flex-1 mx-4 mt-16 mb-4 overflow-hidden rounded-sm border border-[#1a1a2e] bg-[#0f0f1a]">
        <video
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          playsInline
          muted
          aria-hidden="true"
        />

        {handData && containerSize.width > 0 && (
          <HandWireframe
            landmarks={handData.landmarks}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        )}

        {phase === "calibrated" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#08080e]/60 z-10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#00f5d4] flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#00f5d4]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <p
                className="text-lg font-bold text-[#e8e8f0]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Calibration Complete
              </p>
            </div>
          </div>
        )}

        {(!handData || phase === "waiting") && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#ff4060]/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#ff4060]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                </svg>
              </div>
              <p className="text-sm font-mono text-[#6c6c80]">
                No hand detected
              </p>
              <p className="text-xs font-mono text-[#48485a] mt-1">
                Position your hand in front of the camera
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-sm border border-[#1a1a2e] bg-[#0f0f1a]/80">
          <span
            className="text-xl shrink-0"
            style={{ color: phaseColor }}
            aria-hidden="true"
          >
            {PHASE_ICONS[phase]}
          </span>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold tracking-wide truncate"
              style={{ color: phaseColor, fontFamily: "var(--font-display)" }}
            >
              {message}
            </p>
            <p className="text-[10px] font-mono text-[#48485a] mt-0.5" aria-live="polite">
              {phase === "waiting" && "Show your open hand to the camera"}
              {phase === "detecting" && "Keep your hand still to calibrate"}
              {phase === "steady" && "Hold this position"}
              {phase === "calibrated" && "Ready to play"}
            </p>
          </div>
        </div>

        <div className="px-4 py-3 rounded-sm border border-[#1a1a2e] bg-[#0f0f1a]/80 space-y-2">
          <StatusBar
            label="Confidence"
            value={confidence}
            color={confidence > 0.7 ? "#00f5d4" : confidence > 0.5 ? "#ffaa00" : "#ff4060"}
          />
          <StatusBar
            label="Stability"
            value={stabilityProgress}
            color="#6c5ce7"
          />
          <StatusBar
            label="Visibility"
            value={visibility}
            color={visibility > 0.7 ? "#00f5d4" : "#ffaa00"}
          />
        </div>

        <button
          onClick={onSkipToMouse}
          className="group relative w-full py-3 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#48485a] transition-all duration-300 cursor-pointer hover:text-[#6c6c80]"
        >
          <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/10 group-hover:ring-[#6c6c80]/30 transition-all duration-300" />
          <span className="relative z-10">
            Skip to Mouse Controls
          </span>
        </button>
      </div>
    </div>
  );
}
