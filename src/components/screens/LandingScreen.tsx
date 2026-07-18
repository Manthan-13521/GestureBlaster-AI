"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ParticleBackground from "@/components/ui/ParticleBackground";
import SettingsModal from "@/components/game/SettingsModal";
import { useGameSettings } from "@/hooks/useGameSettings";

export default function LandingScreen() {
  const [ready, setReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  
  const { settings } = useGameSettings();
  const { reducedMotion, highContrastUi } = settings.accessibility;

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSettingsClose = () => {
    setShowSettings(false);
    // Return focus to settings button
    setTimeout(() => {
      settingsBtnRef.current?.focus();
    }, 0);
  };

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#08080e]">
        <div className={`w-8 h-8 rounded-full border-2 border-[#6c5ce7] border-t-transparent ${reducedMotion ? "" : "animate-spin"}`} />
      </div>
    );
  }

  // Visual tweaks for High Contrast UI
  const textContrastClass = highContrastUi ? "text-white" : "text-[#6c6c80]";
  const borderContrastClass = highContrastUi ? "ring-[#00f5d4] ring-2" : "ring-[#00f5d4]/50 ring-1";
  const focusClass = "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00f5d4] focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080e]";

  return (
    <div className="relative min-h-screen flex flex-col bg-[#08080e] overflow-hidden select-none">
      {!reducedMotion && <ParticleBackground />}
      
      <ScanLines reducedMotion={reducedMotion} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-[#00f5d4] ${reducedMotion ? "" : "animate-pulse"}`} />
            <span className={`text-xs font-mono tracking-widest uppercase ${textContrastClass}`}>
              SYSTEM ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono tracking-wider ${textContrastClass}`}>
              v0.1.0
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div
            className={`transition-all ${reducedMotion ? "duration-0" : "duration-1000"} ease-out ${
              ready
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative inline-block mb-4 sm:mb-6">
              {!reducedMotion && (
                <div className="absolute -inset-4 bg-gradient-to-r from-[#6c5ce7]/20 via-[#00f5d4]/10 to-[#8833ff]/20 rounded-full blur-3xl pointer-events-none" />
              )}
              <h1
                className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8e8f0] via-[#00f5d4] to-[#6c5ce7]">
                  HANDSHOOTER
                </span>
              </h1>
            </div>

            <p className={`text-base sm:text-lg md:text-xl font-mono tracking-[0.3em] uppercase mb-1 ${textContrastClass}`}>
              gesture-controlled combat
            </p>

            <GlitchText text="REALITY IS BREAKING" reducedMotion={reducedMotion} />

            <div className="flex flex-col items-center justify-center gap-6 mt-12 sm:mt-16">
              <button
                onClick={() => router.push("/game")}
                className={`group relative flex items-center justify-center w-64 h-16 rounded-sm font-display text-lg font-bold tracking-[0.25em] uppercase text-[#08080e] cursor-pointer ${
                  reducedMotion ? "transition-none" : "transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
                } ${focusClass}`}
                style={{ fontFamily: "var(--font-display)" }}
                aria-label="Play Game"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7] rounded-sm transition-opacity duration-300 group-hover:opacity-90" />
                {!reducedMotion && (
                  <span className="absolute inset-0 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-lg group-hover:blur-xl" />
                )}
                <span className={`absolute inset-0 rounded-sm ${borderContrastClass} group-hover:ring-[#00f5d4] transition-all duration-300`} />
                <span className="relative z-10">PLAY</span>
              </button>

              <button
                ref={settingsBtnRef}
                onClick={() => setShowSettings(true)}
                className={`group relative flex items-center justify-center w-48 h-12 font-mono text-sm tracking-[0.2em] uppercase transition-all ${
                  reducedMotion ? "duration-0" : "duration-300"
                } cursor-pointer ${highContrastUi ? "text-white hover:text-white border border-[#6c6c80] hover:border-white" : "text-[#6c6c80] hover:text-[#e8e8f0]"} ${focusClass}`}
                aria-label="Open Settings"
              >
                {!highContrastUi && (
                  <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300" />
                )}
                <span className="relative z-10">SETTINGS</span>
              </button>
            </div>

            <div className={`mt-16 sm:mt-20 flex items-center justify-center gap-6 text-[10px] sm:text-xs font-mono tracking-wider uppercase ${textContrastClass}`}>
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#00f5d4]" />
                Camera Required
              </span>
              <span className="w-px h-3 bg-[#48485a]" />
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6c5ce7]" />
                Local Processing
              </span>
              <span className="w-px h-3 bg-[#48485a]" />
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#8833ff]" />
                No Upload
              </span>
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-6 py-5 sm:px-10">
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono tracking-wider ${textContrastClass}`}>
            <span>HandsShooter 2026</span>
            <span className="flex items-center gap-2">
              <span className={`w-1 h-1 rounded-full bg-[#00f5d4] ${reducedMotion ? "" : "animate-pulse"}`} />
              Ready
            </span>
          </div>
        </footer>
      </div>

      {showSettings && <SettingsModal onClose={handleSettingsClose} />}
    </div>
  );
}

function ScanLines({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return null;
  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 opacity-[0.03]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
      }}
      aria-hidden="true"
    />
  );
}

function GlitchText({ text, reducedMotion }: { text: string, reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <div className="relative inline-block mt-3">
        <p className="text-xs sm:text-sm font-mono text-[#6c6c80] tracking-[0.4em] uppercase">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="relative inline-block mt-3">
      <p
        className="text-xs sm:text-sm font-mono text-[#6c6c80] tracking-[0.4em] uppercase relative"
        style={{ animation: "text-glitch 8s infinite" }}
      >
        {text}
      </p>
      <p
        className="absolute inset-0 text-xs sm:text-sm font-mono tracking-[0.4em] uppercase text-[#00f5d4]/30"
        style={{
          clipPath: "inset(40% 0 60% 0)",
          transform: "translate(-1px, 0)",
          animation: "text-glitch 8s infinite",
          animationDelay: "0.05s",
        }}
        aria-hidden="true"
      >
        {text}
      </p>
      <p
        className="absolute inset-0 text-xs sm:text-sm font-mono tracking-[0.4em] uppercase text-[#8833ff]/30"
        style={{
          clipPath: "inset(60% 0 40% 0)",
          transform: "translate(1px, 0)",
          animation: "text-glitch 8s infinite",
          animationDelay: "0.1s",
        }}
        aria-hidden="true"
      >
        {text}
      </p>
    </div>
  );
}
