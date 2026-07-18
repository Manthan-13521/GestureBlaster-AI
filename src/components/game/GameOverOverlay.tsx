"use client";

import { useRef, useEffect, useState } from "react";
import type { EngineStateSnapshot } from "@/engine/types";

interface GameOverOverlayProps {
  engineStateRef: React.RefObject<EngineStateSnapshot>;
  onRestart: () => void;
}

export default function GameOverOverlay({ engineStateRef, onRestart }: GameOverOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [finalState, setFinalState] = useState<EngineStateSnapshot | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = engineStateRef.current;
      if (s && s.gameOver) {
        if (!visible) {
          setVisible(true);
          setFinalState({ ...s });
        }
      } else if (visible) {
        setVisible(false);
        setFinalState(null);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [engineStateRef, visible]);

  if (!visible || !finalState) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080e]/90 select-none" role="dialog" aria-modal="true" aria-label="Game Over">
      <div className="relative w-full max-w-md mx-6">
        <div className="absolute -inset-8 bg-gradient-to-r from-[#6c5ce7]/15 via-[#ff4060]/5 to-[#6c5ce7]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full border border-[#ff4060]/30">
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold text-[#e8e8f0] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            GAME OVER
          </h1>

          <p className="text-sm font-mono text-[#48485a] tracking-[0.15em] uppercase mb-8">
            Wave {finalState.wave} &middot; Killed {finalState.kills} enemies
          </p>

          <div className="flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center py-3 px-5 rounded-sm bg-[#0f0f1a]/60 border border-[#6c5ce7]/10">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#48485a]">
                Score
              </span>
              <span className="font-mono text-lg font-bold text-[#00f5d4] tabular-nums">
                {finalState.score.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 px-5 rounded-sm bg-[#0f0f1a]/40 border border-[#6c5ce7]/5">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#48485a]">
                Kills
              </span>
              <span className="font-mono text-sm text-[#e8e8f0] tabular-nums">
                {finalState.kills}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 px-5 rounded-sm bg-[#0f0f1a]/40 border border-[#6c5ce7]/5">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#48485a]">
                Survival
              </span>
              <span className="font-mono text-sm text-[#e8e8f0] tabular-nums">
                {Math.floor(finalState.sessionTime)}s
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 px-5 rounded-sm bg-[#0f0f1a]/40 border border-[#6c5ce7]/5">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#48485a]">
                Best Weapon
              </span>
              <span className="font-mono text-sm text-[#e8e8f0] tabular-nums">
                Level {finalState.weaponLevel}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onRestart}
              className="group relative w-full py-4 rounded-sm font-display text-sm font-bold tracking-[0.25em] uppercase text-[#08080e] transition-all duration-300 cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7] rounded-sm transition-opacity duration-300 group-hover:opacity-90" />
              <span className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-xl" />
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#00f5d4]/50 group-hover:ring-[#6c5ce7]/70" />
              <span className="relative z-10">Play Again</span>
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="group relative w-full py-4 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
            >
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300" />
              <span className="relative z-10">Back to Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
