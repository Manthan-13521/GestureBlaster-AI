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

export default function HUD({ engineStateRef }: HUDProps) {
  const [state, setState] = useState<EngineStateSnapshot>(INITIAL_SNAPSHOT);
  const rafRef = useRef<number | null>(null);
  const prevWeaponRef = useRef(1);
  const prevWaveRef = useRef(1);
  const [levelBounce, setLevelBounce] = useState(false);
  const [waveBounce, setWaveBounce] = useState(false);

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

  useEffect(() => {
    if (state.weaponLevel > prevWeaponRef.current) {
      setLevelBounce(true);
      const t = setTimeout(() => setLevelBounce(false), 500);
      prevWeaponRef.current = state.weaponLevel;
      return () => clearTimeout(t);
    }
  }, [state.weaponLevel]);

  useEffect(() => {
    if (state.wave !== prevWaveRef.current) {
      setWaveBounce(true);
      const t = setTimeout(() => setWaveBounce(false), 400);
      prevWaveRef.current = state.wave;
      return () => clearTimeout(t);
    }
  }, [state.wave]);

  const hpRatio = state.maxHp > 0 ? Math.max(0, state.hp / state.maxHp) : 0;
  const weaponName = WEAPON_LEVELS[Math.min(state.weaponLevel - 1, WEAPON_LEVELS.length - 1)]?.name ?? "Basic Blaster";

  const hpColor = hpRatio > 0.5 ? "#00f5d4" : hpRatio > 0.25 ? "#ffaa00" : "#ff4060";

  return (
    <>
      <div className="absolute top-0 left-0 z-20 p-4 select-none pointer-events-none">
        <div className="font-mono text-[#e8e8f0]">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-wider tabular-nums">
              {state.score.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3 text-[10px] tracking-[0.15em] uppercase text-[#48485a] mt-1">
            <span>{state.kills} kill{state.kills !== 1 ? "s" : ""}</span>
            <span>Wave {state.wave}</span>
            <span>{Math.floor(state.sessionTime)}s</span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 z-20 p-4 select-none pointer-events-none">
        <div className="flex flex-col items-end gap-2">
          <div
            className={`font-mono text-[11px] tracking-[0.15em] uppercase tabular-nums transition-transform duration-200 ${
              levelBounce ? "scale-125" : "scale-100"
            } text-[#00f5d4]`}
          >
            {weaponName}
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-[#48485a]">
            Lv.{state.weaponLevel}
          </div>
          <div className="font-mono text-[10px] tracking-[0.15em] text-[#6c6c80]">
            {state.monsterCount} enemies
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 w-64 select-none pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#48485a]">
            HP
          </span>
          <span className="font-mono text-[10px] tabular-nums text-[#e8e8f0]">
            {state.hp}/{state.maxHp}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#1a1a2e] overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{
              width: `${hpRatio * 100}%`,
              backgroundColor: hpColor,
              boxShadow: `0 0 8px ${hpColor}44`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pulse-charge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; box-shadow: 0 0 20px rgba(108, 92, 231, 1), 0 0 40px rgba(0, 245, 212, 0.6); }
        }
        .animate-pulse-charge {
          animation: pulse-charge 0.6s ease-in-out infinite;
        }
        @keyframes ping-charge {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(6); opacity: 0; }
        }
        .animate-ping-charge {
          animation: ping-charge 1s ease-out infinite;
        }
      `}</style>
    </>
  );
}
