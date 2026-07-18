"use client";

import { useRef, useEffect } from "react";

interface GameCanvasProps {
  gameCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function GameCanvas({ gameCanvasRef, fxCanvasRef }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return () => {};
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={gameCanvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
      <canvas
        ref={fxCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
