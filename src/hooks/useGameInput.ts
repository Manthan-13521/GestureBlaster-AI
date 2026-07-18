"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { AimInput } from "@/types/input";
import { MouseAdapter } from "@/input/mouse-adapter";
import { TouchAdapter } from "@/input/touch-adapter";
import type { HandData } from "@/types/landmarks";
import type { CoordinateMapper } from "@/input/coordinate-mapper";

interface UseGameInputOptions {
  inputMode: "hand" | "mouse" | "touch";
  handData: HandData | null;
  coordinateMapper: CoordinateMapper | null;
  width: number;
  height: number;
}

const defaultInput: AimInput = {
  angle: 0,
  isActive: false,
  confidence: 0,
  source: "mouse",
  position: { x: 0, y: 0 },
};

export function useGameInput({
  inputMode,
  handData,
  coordinateMapper,
  width,
  height,
}: UseGameInputOptions) {
  const [input, setInput] = useState<AimInput>(defaultInput);

  const mouseRef = useRef<MouseAdapter | null>(null);
  const touchRef = useRef<TouchAdapter | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const [attached, setAttached] = useState(false);
  const widthRef = useRef(width);
  const heightRef = useRef(height);

  useEffect(() => {
    widthRef.current = width;
    heightRef.current = height;
  }, [width, height]);

  const attach = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    setAttached(true);
  }, []);

  const detach = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (mouseRef.current) {
      mouseRef.current.detach();
      mouseRef.current = null;
    }
    if (touchRef.current) {
      touchRef.current.detach();
      touchRef.current = null;
    }
    elementRef.current = null;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    runningRef.current = true;

    if (inputMode === "mouse") {
      if (!mouseRef.current) {
        mouseRef.current = new MouseAdapter();
        mouseRef.current.attach(element);
      }
    } else if (inputMode === "touch") {
      if (!touchRef.current) {
        touchRef.current = new TouchAdapter();
        touchRef.current.attach(element);
      }
    }

    const loop = () => {
      if (!runningRef.current) return;

      const cx = widthRef.current / 2;
      const cy = heightRef.current / 2;

      if (inputMode === "mouse" && mouseRef.current) {
        const pos = mouseRef.current.position;
        const active = mouseRef.current.isActive;
        const angle = Math.atan2(pos.y - cy, pos.x - cx);
        setInput({
          angle,
          isActive: active,
          confidence: active ? 1 : 0,
          source: "mouse",
          position: pos,
        });
      } else if (inputMode === "touch" && touchRef.current) {
        const pos = touchRef.current.position;
        const active = touchRef.current.isActive;
        const angle = Math.atan2(pos.y - cy, pos.x - cx);
        setInput({
          angle,
          isActive: active,
          confidence: active ? 1 : 0,
          source: "touch",
          position: pos,
        });
      } else if (inputMode === "hand" && handData && coordinateMapper) {
        const indexTip = handData.landmarks[8];
        if (indexTip) {
          const pos = coordinateMapper.mapToViewport(indexTip.x, indexTip.y);
          const angle = Math.atan2(pos.y - cy, pos.x - cx);
          setInput({
            angle,
            isActive: true,
            confidence: handData.confidence,
            source: "hand",
            position: pos,
          });
        } else {
          setInput((prev) => ({
            ...prev,
            isActive: false,
            confidence: 0,
          }));
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      mouseRef.current?.detach();
      mouseRef.current = null;
      touchRef.current?.detach();
      touchRef.current = null;
    };
  }, [inputMode, handData, coordinateMapper, attached]);

  return { input, attach, detach };
}
