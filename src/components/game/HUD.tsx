"use client";

import { useRef, useEffect, useState } from "react";
import type { EngineStateSnapshot } from "@/engine/types";
import { WEAPON_LEVELS } from "@/engine/weapon-system";

interface HUDProps {
  engineStateRef: React.RefObject<EngineStateSnapshot>;
}

const INITIAL_SNAPSHOT: EngineStateSnapshot = {
  score: 0, kills: 0, wave: 1, sessionTime: 0,
  hp: 100, maxHp: 100, gameOver: false, weaponLevel: 1,
  monsterCount: 0, highScore: 0,
};

function formatScore(n: number): string {
  return n.toLocaleString("en-US", { minimumIntegerDigits: 6, useGrouping: false });
}

export default function HUD({ engineStateRef }: HUDProps) {
  const [state, setState] = useState<EngineStateSnapshot>(INITIAL_SNAPSHOT);
  const rafRef = useRef<number | null>(null);
  const prevWeaponRef = useRef(1);
  const [levelBounce, setLevelBounce] = useState(false);
  const [scorePulse, setScorePulse] = useState(false);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const s = engineStateRef.current;
      if (s) setState(s);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [engineStateRef]);

  // Weapon level bounce
  useEffect(() => {
    if (state.weaponLevel > prevWeaponRef.current) {
      setLevelBounce(true);
      const t = setTimeout(() => setLevelBounce(false), 600);
      prevWeaponRef.current = state.weaponLevel;
      return () => clearTimeout(t);
    }
  }, [state.weaponLevel]);

  // Score pulse on change
  useEffect(() => {
    if (state.score > prevScoreRef.current) {
      setScorePulse(true);
      const t = setTimeout(() => setScorePulse(false), 300);
      prevScoreRef.current = state.score;
      return () => clearTimeout(t);
    }
  }, [state.score]);

  const hpRatio = state.maxHp > 0 ? Math.max(0, state.hp / state.maxHp) : 0;
  const weaponName = WEAPON_LEVELS[Math.min(state.weaponLevel - 1, WEAPON_LEVELS.length - 1)]?.name ?? "Basic Blaster";
  const hpColor = hpRatio > 0.5 ? "#00f5d4" : hpRatio > 0.25 ? "#ffaa00" : "#ff4060";
  const hpLow = hpRatio <= 0.25;

  return (
    <>
      {/* ── TOP-LEFT: Score block ─────────────────────────────────────── */}
      <div className="absolute top-0 left-0 z-20 p-3 sm:p-4 select-none pointer-events-none">
        <div
          className="px-4 py-3 rounded-sm border border-[#ffffff08] bg-[#08080e]/70 backdrop-blur-sm"
          style={{ boxShadow: "0 0 20px rgba(0,0,0,0.4)" }}
        >
          {/* Label */}
          <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#48485a] mb-1">
            Score
          </div>
          {/* Score number */}
          <div
            className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums tracking-widest transition-all duration-150 ${
              scorePulse ? "text-[#00f5d4] scale-105" : "text-[#e8e8f0]"
            }`}
            style={{
              fontFamily: "var(--font-display)",
              textShadow: scorePulse ? "0 0 20px rgba(0,245,212,0.8)" : undefined,
            }}
          >
            {formatScore(state.score)}
          </div>
          {/* Sub-stats */}
          <div className="flex items-center gap-3 mt-2">
            <StatChip label={`${state.kills} kills`} />
            <StatChip label={`${Math.floor(state.sessionTime)}s`} color="#6c6c80" />
          </div>
        </div>
      </div>

      {/* ── TOP-RIGHT: Wave + Weapon ───────────────────────────────────── */}
      <div className="absolute top-0 right-0 z-20 p-3 sm:p-4 select-none pointer-events-none">
        <div
          className="flex flex-col items-end gap-1 px-4 py-3 rounded-sm border border-[#ffffff08] bg-[#08080e]/70 backdrop-blur-sm"
          style={{ boxShadow: "0 0 20px rgba(0,0,0,0.4)" }}
        >
          {/* Wave badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#48485a]">Wave</span>
            <span
              className="font-mono text-xl font-bold text-[#6c5ce7] tabular-nums"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 0 12px rgba(108,92,231,0.6)" }}
            >
              {state.wave}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#ffffff08] my-1" />

          {/* Weapon */}
          <div
            className={`font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-200 ${
              levelBounce ? "text-[#00f5d4] scale-110" : "text-[#00f5d4]/70"
            }`}
            style={{ textShadow: levelBounce ? "0 0 12px rgba(0,245,212,0.8)" : undefined }}
          >
            {weaponName}
          </div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-[#48485a]">
            Lv.{state.weaponLevel} · {state.monsterCount} enemies
          </div>
        </div>
      </div>

      {/* ── BOTTOM-CENTER: HP bar ─────────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-72 sm:w-80 select-none pointer-events-none">
        <div
          className={`px-4 py-3 rounded-sm border backdrop-blur-sm ${
            hpLow
              ? "border-[#ff4060]/30 bg-[#08080e]/80"
              : "border-[#ffffff08] bg-[#08080e]/70"
          }`}
          style={{
            boxShadow: hpLow
              ? "0 0 20px rgba(255,64,96,0.15), 0 0 0 1px rgba(255,64,96,0.1)"
              : "0 0 20px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#48485a]">
              Shield
            </span>
            <span
              className={`font-mono text-xs font-bold tabular-nums transition-colors duration-300 ${
                hpLow ? "text-[#ff4060]" : "text-[#e8e8f0]"
              }`}
            >
              {state.hp}
              <span className="text-[#48485a] font-normal">/{state.maxHp}</span>
            </span>
          </div>

          {/* Track */}
          <div className="h-2.5 rounded-full bg-[#0d0d1a] overflow-hidden relative">
            {/* Glow layer behind bar */}
            <div
              className="absolute inset-0 rounded-full blur-sm opacity-50 transition-[width] duration-200"
              style={{ width: `${hpRatio * 100}%`, backgroundColor: hpColor }}
            />
            {/* Solid bar */}
            <div
              className={`h-full rounded-full transition-[width] duration-200 relative ${
                hpLow ? "animate-pulse" : ""
              }`}
              style={{ width: `${hpRatio * 100}%`, backgroundColor: hpColor }}
            />
          </div>

          {/* Segment ticks */}
          <div className="flex justify-between mt-1.5 px-0.5">
            {[0.25, 0.5, 0.75].map((pct) => (
              <div
                key={pct}
                className="w-px h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    hpRatio >= pct ? `${hpColor}60` : "rgba(255,255,255,0.06)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-charge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; box-shadow: 0 0 20px rgba(108, 92, 231, 1), 0 0 40px rgba(0, 245, 212, 0.6); }
        }
        .animate-pulse-charge { animation: pulse-charge 0.6s ease-in-out infinite; }
        @keyframes ping-charge {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(6); opacity: 0; }
        }
        .animate-ping-charge { animation: ping-charge 1s ease-out infinite; }
      `}</style>
    </>
  );
}

function StatChip({ label, color = "#6c5ce7" }: { label: string; color?: string }) {
  return (
    <span
      className="font-mono text-[9px] tracking-[0.15em] uppercase px-1.5 py-0.5 rounded"
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}28` }}
    >
      {label}
    </span>
  );
}
