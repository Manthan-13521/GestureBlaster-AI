"use client";

import { useEffect, useState } from "react";
import type { TutorialState, TutorialStep } from "@/types/tutorial";

interface TutorialPromptProps {
  tutorialState: TutorialState;
  reducedMotion: boolean;
  highContrastUi: boolean;
}

const STEP_CONTENT: Record<
  TutorialStep,
  { heading: string; sub: string; color: string }
> = {
  pinch: {
    heading: "PINCH TO CHARGE",
    sub: "Bring your thumb and index finger together",
    color: "#00f5d4",
  },
  release: {
    heading: "RELEASE TO FIRE",
    sub: "Open your fingers to launch the projectile",
    color: "#6c5ce7",
  },
  hit: {
    heading: "GOOD SHOT",
    sub: "Keep firing — destroy the enemy",
    color: "#00f5d4",
  },
  complete: {
    heading: "GOOD SHOT",
    sub: "",
    color: "#00f5d4",
  },
};

export default function TutorialPrompt({
  tutorialState,
  reducedMotion,
  highContrastUi,
}: TutorialPromptProps) {
  const [visible, setVisible] = useState(false);

  // Fade in on first render
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Hide after completion hold
  useEffect(() => {
    if (!tutorialState.completed) return;
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [tutorialState.completed]);

  if (!tutorialState.active && !tutorialState.completed) return null;
  if (!visible) return null;

  const step = tutorialState.completed ? "complete" : tutorialState.step;
  const content = STEP_CONTENT[step];

  const bgColor = highContrastUi ? "bg-[#0a0a14]/95" : "bg-[#08080e]/80";
  const subTextColor = highContrastUi ? "text-white/70" : "text-[#9090a8]";
  const borderStyle = highContrastUi
    ? { borderColor: "rgba(255,255,255,0.4)" }
    : { borderColor: `${content.color}44` };

  // Using `key={step}` on the card forces a remount on step change,
  // which re-triggers the CSS fade-in animation without setState-in-effect.
  return (
    <div
      className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Spatial pointer arrow */}
      {!tutorialState.completed && (
        <div className="flex flex-col items-center mb-3">
          <div
            className={`flex flex-col items-center gap-1 ${
              reducedMotion ? "" : "animate-bounce"
            }`}
          >
            <div
              className="w-px h-6 opacity-60"
              style={{
                background: `linear-gradient(to bottom, transparent, ${content.color})`,
              }}
            />
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              className="opacity-80"
            >
              <path d="M6 8L0 0h12L6 8z" fill={content.color} />
            </svg>
          </div>
        </div>
      )}

      {/* Prompt card — keyed to step so remount drives re-animation */}
      <div
        key={step}
        className={`relative px-8 py-4 rounded-sm border backdrop-blur-md text-center ${bgColor} ${
          reducedMotion
            ? "opacity-100"
            : "animate-in fade-in zoom-in-95 duration-200"
        }`}
        style={{
          ...borderStyle,
          boxShadow: highContrastUi
            ? "0 0 24px rgba(255,255,255,0.1)"
            : reducedMotion
            ? undefined
            : `0 0 24px ${content.color}22, 0 0 48px ${content.color}11`,
        }}
      >
        {/* Corner accents — decorative, hidden in reducedMotion */}
        {!reducedMotion && (
          <>
            <span
              className="absolute top-0 left-0 w-3 h-3 border-t border-l rounded-tl-sm opacity-60"
              style={{ borderColor: content.color }}
            />
            <span
              className="absolute top-0 right-0 w-3 h-3 border-t border-r rounded-tr-sm opacity-60"
              style={{ borderColor: content.color }}
            />
            <span
              className="absolute bottom-0 left-0 w-3 h-3 border-b border-l rounded-bl-sm opacity-60"
              style={{ borderColor: content.color }}
            />
            <span
              className="absolute bottom-0 right-0 w-3 h-3 border-b border-r rounded-br-sm opacity-60"
              style={{ borderColor: content.color }}
            />
          </>
        )}

        <p
          className="font-bold tracking-[0.25em] uppercase text-sm sm:text-base"
          style={{ fontFamily: "var(--font-display)", color: content.color }}
        >
          {content.heading}
        </p>

        {content.sub && !tutorialState.completed && (
          <p className={`mt-1 text-xs font-mono tracking-[0.1em] ${subTextColor}`}>
            {content.sub}
          </p>
        )}

        {/* Step indicator dots */}
        {!tutorialState.completed && (
          <div className="flex justify-center gap-2 mt-3">
            {(["pinch", "release", "hit"] as TutorialStep[]).map((s) => {
              const ORDER: TutorialStep[] = ["pinch", "release", "hit", "complete"];
              const currentIdx = ORDER.indexOf(step);
              const dotIdx = ORDER.indexOf(s);
              const isDone = dotIdx < currentIdx;
              const isCurrent = s === step;
              return (
                <span
                  key={s}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isCurrent
                      ? content.color
                      : isDone
                      ? `${content.color}80`
                      : highContrastUi
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(108,108,128,0.3)",
                    transform: isCurrent ? "scale(1.4)" : "scale(1)",
                    transition: reducedMotion ? "none" : "all 0.2s",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
