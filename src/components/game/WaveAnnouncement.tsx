"use client";

/* eslint-disable react-hooks/set-state-in-effect -- WaveAnnouncement needs to reset display state when playing stops */

import { useRef, useEffect, useState } from "react";
import type { EngineStateSnapshot } from "@/engine/types";

interface WaveAnnouncementProps {
  engineStateRef: React.RefObject<EngineStateSnapshot>;
  playing: boolean;
}

const FADE_IN = 300;
const HOLD = 1500;
const FADE_OUT = 400;
const TOTAL = FADE_IN + HOLD + FADE_OUT;

type DisplayState = {
  text: string;
  opacity: number;
  scale: number;
};

export default function WaveAnnouncement({ engineStateRef, playing }: WaveAnnouncementProps) {
  const [display, setDisplay] = useState<DisplayState | null>(null);
  const shownReadyRef = useRef(false);
  const prevWaveRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const announcementRef = useRef<{ text: string; startTime: number } | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) {
      shownReadyRef.current = false;
      prevWaveRef.current = 0;
      announcementRef.current = null;
      setDisplay(null);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      return;
    }

    const tick = () => {
      const s = engineStateRef.current;

      if (s && !shownReadyRef.current) {
        shownReadyRef.current = true;
        prevWaveRef.current = s.wave;
        announcementRef.current = { text: "GET READY", startTime: performance.now() };
        clearTimerRef.current = setTimeout(() => {
          if (announcementRef.current?.text === "GET READY") {
            announcementRef.current = null;
          }
        }, TOTAL);
      }

      if (s && s.wave !== prevWaveRef.current) {
        prevWaveRef.current = s.wave;
        announcementRef.current = { text: `WAVE ${s.wave}`, startTime: performance.now() };
        clearTimerRef.current = setTimeout(() => {
          if (announcementRef.current?.text === `WAVE ${s.wave}`) {
            announcementRef.current = null;
          }
        }, TOTAL);
      }

      const a = announcementRef.current;
      if (a) {
        const elapsed = performance.now() - a.startTime;
        let opacity = 0;
        let scale = 0.8;
        if (elapsed < FADE_IN) {
          const t = elapsed / FADE_IN;
          opacity = t;
          scale = 0.8 + t * 0.2;
        } else if (elapsed < FADE_IN + HOLD) {
          opacity = 1;
          scale = 1;
        } else if (elapsed < TOTAL) {
          const t = (elapsed - FADE_IN - HOLD) / FADE_OUT;
          opacity = 1 - t;
          scale = 1 - t * 0.1;
        } else {
          announcementRef.current = null;
          setDisplay(null);
        }
        setDisplay({ text: a.text, opacity, scale });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [playing, engineStateRef]);

  if (!display) return null;

  const color = display.text === "GET READY" ? "#00f5d4" : "#6c5ce7";
  const shadow =
    display.text === "GET READY"
      ? "0 0 30px rgba(0, 245, 212, 0.5), 0 0 60px rgba(0, 245, 212, 0.2)"
      : "0 0 30px rgba(108, 92, 231, 0.5), 0 0 60px rgba(108, 92, 231, 0.2)";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none select-none" aria-live="polite" aria-atomic="true">
      <div
        className="text-center"
        style={{ opacity: display.opacity, transform: `scale(${display.scale})` }}
      >
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.15em] uppercase"
          style={{ fontFamily: "var(--font-display)", color, textShadow: shadow }}
        >
          {display.text}
        </h1>
      </div>
    </div>
  );
}
