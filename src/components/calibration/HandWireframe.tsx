"use client";

import { useRef, useEffect } from "react";
import type { RawLandmark } from "@/types/landmarks";
import { CoordinateMapper } from "@/input/coordinate-mapper";

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const LANDMARK_COLORS = [
  "#6c5ce7", "#6c5ce7", "#6c5ce7", "#6c5ce7",
  "#6c5ce7", "#00f5d4", "#00f5d4", "#00f5d4",
  "#00f5d4", "#ff4060", "#ff4060", "#ff4060",
  "#ff4060", "#ffaa00", "#ffaa00", "#ffaa00",
  "#ffaa00", "#00d4ff", "#00d4ff", "#00d4ff",
  "#00d4ff",
];

interface HandWireframeProps {
  landmarks: RawLandmark[];
  containerWidth: number;
  containerHeight: number;
}

export default function HandWireframe({
  landmarks,
  containerWidth,
  containerHeight,
}: HandWireframeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    const mapper = new CoordinateMapper(
      { width: 640, height: 480 },
      { width: containerWidth, height: containerHeight },
    );

    ctx.strokeStyle = "rgba(108, 92, 231, 0.35)";
    ctx.lineWidth = 2;

    for (const [i, j] of CONNECTIONS) {
      const a = landmarks[i];
      const b = landmarks[j];
      if (!a || !b) continue;

      const pa = mapper.mapToCanvas(a.x, a.y, containerWidth, containerHeight);
      const pb = mapper.mapToCanvas(b.x, b.y, containerWidth, containerHeight);

      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      if (!lm) continue;

      const p = mapper.mapToCanvas(lm.x, lm.y, containerWidth, containerHeight);
      const color = LANDMARK_COLORS[i] ?? "#6c5ce7";
      const radius = 3;
      const alpha = lm.visibility * 0.8 + 0.2;

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius + 1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }, [landmarks, containerWidth, containerHeight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
