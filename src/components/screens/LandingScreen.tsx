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
    setTimeout(() => {
      settingsBtnRef.current?.focus();
    }, 0);
  };

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#08080e]">
        <div className={`w-8 h-8 rounded-full border-2 border-[#00f5d4] border-t-transparent ${reducedMotion ? "" : "animate-spin"}`} />
      </div>
    );
  }

  const textContrastClass = highContrastUi ? "text-white" : "text-[#6c6c80]";

  return (
    <div className="relative min-h-screen flex flex-col bg-[#08080e] overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,245,212,0.03)_0%,transparent_70%)] rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_bottom,rgba(108,92,231,0.08)_0%,transparent_70%)] rounded-full blur-3xl mix-blend-screen" />
      </div>

      {!reducedMotion && <ParticleBackground />}
      
      <ScanLines reducedMotion={reducedMotion} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3 px-4 py-2 rounded-sm border border-[#00f5d4]/20 bg-[#00f5d4]/5 backdrop-blur-sm">
            <span className={`w-2 h-2 rounded-full bg-[#00f5d4] ${reducedMotion ? "" : "animate-pulse"}`} style={{ boxShadow: "0 0 8px #00f5d4" }} />
            <span className={`text-[9px] font-mono tracking-[0.25em] uppercase text-[#00f5d4]`}>
              SYSTEM ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] font-mono tracking-wider ${textContrastClass}`}>
              v0.1.0
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center">
          <div
            className={`transition-all ${reducedMotion ? "duration-0" : "duration-1000"} ease-out w-full max-w-3xl ${
              ready
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            {/* Main Glass Panel */}
            <div className="relative p-8 sm:p-12 rounded-3xl border border-[#ffffff10] bg-[#08080e]/60 backdrop-blur-md"
                 style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
              
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f5d4]/30 rounded-tl-3xl" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00f5d4]/30 rounded-tr-3xl" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#6c5ce7]/30 rounded-bl-3xl" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#6c5ce7]/30 rounded-br-3xl" />

              <div className="relative inline-block mb-4 sm:mb-6">
                {!reducedMotion && (
                  <div className="absolute -inset-8 bg-gradient-to-r from-[#6c5ce7]/20 via-[#00f5d4]/20 to-[#8833ff]/20 rounded-full blur-3xl pointer-events-none" />
                )}
                <h1
                  className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8e8f0] via-[#00f5d4] to-[#6c5ce7]" style={{ textShadow: "0 0 40px rgba(0,245,212,0.2)" }}>
                    HANDSHOOTER
                  </span>
                </h1>
              </div>

              <p className={`text-base sm:text-lg md:text-xl font-mono tracking-[0.3em] uppercase mb-1 ${textContrastClass}`}>
                gesture-controlled combat
              </p>

              <GlitchText text="REALITY IS BREAKING" reducedMotion={reducedMotion} />

              <div className="flex flex-col items-center justify-center gap-5 mt-12 sm:mt-16">
                <button
                  onClick={() => router.push("/game")}
                  className={`group relative flex items-center justify-center w-full max-w-sm h-16 rounded-sm font-display text-lg font-bold tracking-[0.25em] uppercase text-[#08080e] cursor-pointer ${
                    reducedMotion ? "transition-none" : "transition-transform duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  style={{ fontFamily: "var(--font-display)" }}
                  aria-label="Play Game"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7] rounded-sm transition-opacity duration-300 group-hover:opacity-100 opacity-90" />
                  {!reducedMotion && (
                    <span className="absolute inset-0 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-lg group-hover:blur-xl" />
                  )}
                  <span className="absolute inset-0 rounded-sm ring-1 ring-[#00f5d4]/50 group-hover:ring-[#00f5d4] transition-all duration-300" />
                  <span className="relative z-10 flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                    PLAY
                  </span>
                </button>

                <button
                  ref={settingsBtnRef}
                  onClick={() => setShowSettings(true)}
                  className={`group relative flex items-center justify-center w-full max-w-sm h-14 font-mono text-xs tracking-[0.2em] uppercase transition-all ${
                    reducedMotion ? "duration-0" : "duration-300"
                  } cursor-pointer ${highContrastUi ? "text-white hover:text-white border border-[#6c6c80] hover:border-white" : "text-[#6c6c80] hover:text-[#e8e8f0]"}`}
                  aria-label="Open Settings"
                >
                  {!highContrastUi && (
                    <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300 bg-[#ffffff03] group-hover:bg-[#ffffff08]" />
                  )}
                  <span className="relative z-10">SETTINGS</span>
                </button>
              </div>

              <div className={`mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase ${textContrastClass}`}>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00f5d4]/10 border border-[#00f5d4]/20 text-[#00f5d4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4]" />
                  Camera Required
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 text-[#6c5ce7]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7]" />
                  Local Processing
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffaa00]/10 border border-[#ffaa00]/20 text-[#ffaa00]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00]" />
                  No Upload
                </span>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-6 py-5 sm:px-10">
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono tracking-wider ${textContrastClass}`}>
            <span>HandsShooter 2026</span>
            <span className="flex items-center gap-2">
              <span className={`w-1 h-1 rounded-full bg-[#00f5d4] ${reducedMotion ? "" : "animate-pulse"}`} />
              Systems Online
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
      className="fixed inset-0 pointer-events-none z-20 opacity-[0.04]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)",
      }}
      aria-hidden="true"
    />
  );
}

function GlitchText({ text, reducedMotion }: { text: string, reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <div className="relative inline-block mt-4">
        <p className="text-xs sm:text-sm font-mono text-[#6c6c80] tracking-[0.4em] uppercase">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="relative inline-block mt-4">
      <p
        className="text-xs sm:text-sm font-mono text-[#6c6c80] tracking-[0.4em] uppercase relative"
        style={{ animation: "text-glitch 8s infinite" }}
      >
        {text}
      </p>
      <p
        className="absolute inset-0 text-xs sm:text-sm font-mono tracking-[0.4em] uppercase text-[#00f5d4]/40"
        style={{
          clipPath: "inset(40% 0 60% 0)",
          transform: "translate(-1.5px, 0)",
          animation: "text-glitch 8s infinite",
          animationDelay: "0.05s",
        }}
        aria-hidden="true"
      >
        {text}
      </p>
      <p
        className="absolute inset-0 text-xs sm:text-sm font-mono tracking-[0.4em] uppercase text-[#8833ff]/40"
        style={{
          clipPath: "inset(60% 0 40% 0)",
          transform: "translate(1.5px, 0)",
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
