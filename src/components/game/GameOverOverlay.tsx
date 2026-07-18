"use client";

import { useRef, useEffect, useState } from "react";
import type { EngineStateSnapshot } from "@/engine/types";

interface GameOverOverlayProps {
  engineStateRef: React.RefObject<EngineStateSnapshot>;
  onRestart: () => void;
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-3 px-5 rounded-sm border ${
      accent
        ? "bg-[#0f0f1a]/80 border-[#00f5d4]/20"
        : "bg-[#0f0f1a]/40 border-[#6c5ce7]/08"
    }`}>
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#48485a]">{label}</span>
      <span className={`font-mono text-base font-bold tabular-nums ${
        accent ? "text-[#00f5d4]" : "text-[#e8e8f0]"
      }`} style={accent ? { textShadow: "0 0 12px rgba(0,245,212,0.5)" } : {}}>
        {value}
      </span>
    </div>
  );
}

export default function GameOverOverlay({ engineStateRef, onRestart }: GameOverOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [finalState, setFinalState] = useState<EngineStateSnapshot | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = engineStateRef.current;
      if (s && s.gameOver) {
        if (!visible) {
          setVisible(true);
          setFinalState({ ...s });
          // Stagger entrance animation
          setTimeout(() => setEntered(true), 80);
        }
      } else if (visible) {
        setVisible(false);
        setEntered(false);
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

  const isNewHighScore = finalState.score > 0 && finalState.score >= finalState.highScore;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Game Over"
      style={{
        background: "radial-gradient(ellipse at center, rgba(255,64,96,0.08) 0%, rgba(8,8,14,0.95) 60%)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Ambient glow rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ff4060 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, #6c5ce7 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-sm mx-5 transition-all duration-500"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
        }}
      >
        {/* Card bg */}
        <div
          className="relative px-6 py-8 rounded-sm border border-[#ff4060]/20 bg-[#08080e]/90"
          style={{
            boxShadow: "0 0 60px rgba(255,64,96,0.12), 0 0 120px rgba(108,92,231,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff4060]/40 rounded-tl-sm" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff4060]/40 rounded-tr-sm" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#6c5ce7]/30 rounded-bl-sm" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#6c5ce7]/30 rounded-br-sm" />

          {/* Header */}
          <div className="text-center mb-6">
            {/* Icon */}
            <div
              className="inline-flex items-center justify-center w-14 h-14 mb-5 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,64,96,0.15) 0%, transparent 70%)",
                border: "1px solid rgba(255,64,96,0.3)",
                boxShadow: "0 0 20px rgba(255,64,96,0.2)",
              }}
            >
              <svg className="w-6 h-6 text-[#ff4060]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold tracking-[0.15em] uppercase mb-1"
              style={{
                fontFamily: "var(--font-display)",
                color: "#ff4060",
                textShadow: "0 0 30px rgba(255,64,96,0.5), 0 0 60px rgba(255,64,96,0.2)",
              }}
            >
              GAME OVER
            </h1>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#48485a]">
              Wave {finalState.wave} · {finalState.kills} {finalState.kills === 1 ? "kill" : "kills"}
            </p>

            {isNewHighScore && (
              <div
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[9px] font-mono tracking-[0.2em] uppercase font-bold"
                style={{
                  color: "#ffaa00",
                  background: "rgba(255,170,0,0.1)",
                  border: "1px solid rgba(255,170,0,0.3)",
                  textShadow: "0 0 8px rgba(255,170,0,0.6)",
                }}
              >
                <span>★</span> New High Score
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            className="h-px w-full mb-5"
            style={{ background: "linear-gradient(to right, transparent, rgba(108,92,231,0.3), transparent)" }}
          />

          {/* Stats */}
          <div className="flex flex-col gap-2 mb-6">
            <StatRow label="Score" value={finalState.score.toLocaleString()} accent />
            <StatRow label="Survival" value={`${Math.floor(finalState.sessionTime)}s`} />
            <StatRow label="Best Weapon" value={`Level ${finalState.weaponLevel}`} />
            {finalState.highScore > 0 && (
              <StatRow label="Best Score" value={finalState.highScore.toLocaleString()} />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {/* Play Again */}
            <button
              id="game-over-play-again"
              onClick={onRestart}
              className="group relative w-full py-4 rounded-sm font-bold tracking-[0.25em] uppercase text-sm text-[#08080e] transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7]" />
              <span className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-lg" />
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#00f5d4]/50 group-hover:ring-[#00f5d4]/80 transition-all duration-200" />
              <span className="relative z-10">Play Again</span>
            </button>

            {/* Back to Menu */}
            <button
              id="game-over-back-menu"
              onClick={() => (window.location.href = "/")}
              className="group relative w-full py-3 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-200 cursor-pointer hover:text-[#e8e8f0]"
            >
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/15 group-hover:ring-[#6c6c80]/35 transition-all duration-200" />
              <span className="relative z-10">Back to Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
