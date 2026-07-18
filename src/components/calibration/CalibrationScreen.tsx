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
  waiting: "🖐",
  detecting: "✋",
  steady: "⏳",
  calibrated: "✅",
};

function GlowStatusBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.min(value * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6c6c80]">{label}</span>
        <span
          className="font-mono text-[10px] font-bold tabular-nums"
          style={{ color }}
        >
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#0d0d1a] overflow-hidden relative">
        {/* Glow blur layer */}
        <div
          className="absolute inset-0 rounded-full blur-sm transition-[width] duration-200 opacity-60"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        {/* Solid bar */}
        <div
          className="h-full rounded-full transition-[width] duration-200 relative z-10"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
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
      {/* Radial ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-30"
        style={{ background: `radial-gradient(ellipse, ${phaseColor}40 0%, transparent 70%)` }}
      />

      {/* Top chrome */}
      <div className="absolute top-0 inset-x-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ffffff08]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[#48485a] hover:text-[#00f5d4] transition-colors duration-200 cursor-pointer px-3 py-2 rounded-sm hover:bg-[#00f5d4]/5"
            aria-label="Back to main menu"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#ffffff08] bg-[#ffffff05]">
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
              style={{ backgroundColor: phaseColor, boxShadow: `0 0 6px ${phaseColor}` }}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6c6c80]">
              Hand Calibration
            </span>
          </div>
        </div>
      </div>

      {/* Camera viewfinder */}
      <div className="relative flex-1 mx-4 mt-14 mb-4 overflow-hidden rounded-2xl border border-[#ffffff10] bg-[#0f0f1a]"
           style={{ boxShadow: `0 0 0 1px ${phaseColor}20, inset 0 1px 0 rgba(255,255,255,0.05)` }}>

        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl transition-colors duration-500 z-10" style={{ borderColor: phaseColor }} />
        <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl transition-colors duration-500 z-10" style={{ borderColor: phaseColor }} />
        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl transition-colors duration-500 z-10" style={{ borderColor: phaseColor }} />
        <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl transition-colors duration-500 z-10" style={{ borderColor: phaseColor }} />

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

        {/* Calibrated overlay */}
        {phase === "calibrated" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#08080e]/70 backdrop-blur-sm z-10">
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto mb-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: "#00f5d4", boxShadow: "0 0 30px rgba(0,245,212,0.4)" }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: "#00f5d4", filter: "drop-shadow(0 0 10px #00f5d4)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p
                className="text-xl font-bold tracking-widest"
                style={{ fontFamily: "var(--font-display)", color: "#00f5d4", textShadow: "0 0 20px rgba(0,245,212,0.5)" }}
              >
                Calibration Complete
              </p>
              <p className="text-xs font-mono text-[#6c6c80] mt-2 tracking-widest uppercase">Launching game...</p>
            </div>
          </div>
        )}

        {/* No hand detected overlay */}
        {(!handData || phase === "waiting") && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#ff4060]/30 flex items-center justify-center bg-[#ff4060]/5">
                <svg
                  className="w-8 h-8 text-[#ff4060]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <p className="text-sm font-bold font-mono text-[#ff4060] tracking-widest uppercase">No hand detected</p>
              <p className="text-xs font-mono text-[#48485a] mt-1">Position your open hand in the frame</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-4 space-y-3">
        {/* Status message card */}
        <div
          className="flex items-center gap-4 px-5 py-4 rounded-xl border bg-[#08080e]/80 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${phaseColor}30`, boxShadow: `0 0 20px ${phaseColor}10` }}
        >
          <span
            className="text-2xl shrink-0"
            aria-hidden="true"
          >
            {PHASE_ICONS[phase]}
          </span>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold tracking-widest uppercase truncate"
              style={{ color: phaseColor, fontFamily: "var(--font-display)", textShadow: `0 0 10px ${phaseColor}60` }}
            >
              {message}
            </p>
            <p className="text-[10px] font-mono text-[#48485a] mt-1 tracking-wider" aria-live="polite">
              {phase === "waiting" && "Show your open hand to the camera"}
              {phase === "detecting" && "Keep your hand still to calibrate"}
              {phase === "steady" && "Hold this position..."}
              {phase === "calibrated" && "Ready to play"}
            </p>
          </div>
        </div>

        {/* Metrics panel */}
        <div className="px-5 py-4 rounded-xl border border-[#ffffff10] bg-[#08080e]/60 backdrop-blur-sm space-y-3">
          <GlowStatusBar
            label="Confidence"
            value={confidence}
            color={confidence > 0.7 ? "#00f5d4" : confidence > 0.5 ? "#ffaa00" : "#ff4060"}
          />
          <GlowStatusBar
            label="Stability"
            value={stabilityProgress}
            color="#6c5ce7"
          />
          <GlowStatusBar
            label="Visibility"
            value={visibility}
            color={visibility > 0.7 ? "#00f5d4" : "#ffaa00"}
          />
        </div>

        <button
          onClick={onSkipToMouse}
          className="group relative w-full py-4 rounded-xl font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#48485a] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
        >
          <span className="absolute inset-0 rounded-xl ring-1 ring-[#ffffff08] group-hover:ring-[#ffffff20] bg-[#ffffff05] group-hover:bg-[#ffffff0a] transition-all duration-300" />
          <span className="relative z-10">Skip to Mouse Controls</span>
        </button>
      </div>
    </div>
  );
}
