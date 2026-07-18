"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticleBackground from "@/components/ui/ParticleBackground";

export default function LandingScreen() {
  const [ready, setReady] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#08080e]">
        <div className="w-8 h-8 rounded-full border-2 border-[#6c5ce7] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#08080e] overflow-hidden select-none">
      <ParticleBackground />

      <ScanLines />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
            <span className="text-xs font-mono text-[#6c6c80] tracking-widest uppercase">
              SYSTEM ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#48485a] tracking-wider">
              v0.1.0
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div
            className={`transition-all duration-1000 ease-out ${
              ready
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#6c5ce7]/20 via-[#00f5d4]/10 to-[#8833ff]/20 rounded-full blur-3xl" />
              <h1
                className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8e8f0] via-[#00f5d4] to-[#6c5ce7]">
                  HANDSHOOTER
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl font-mono text-[#6c6c80] tracking-[0.3em] uppercase mb-3">
              AR Monster Defense
            </p>

            <GlitchText text="REALITY IS BREAKING" />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 sm:mt-12">
              <button
                onClick={() => router.push("/game")}
                className="group relative px-10 py-4 sm:px-14 sm:py-5 rounded-sm font-display text-sm sm:text-base font-bold tracking-[0.25em] uppercase text-[#08080e] transition-all duration-300 cursor-pointer"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7] rounded-sm transition-opacity duration-300 group-hover:opacity-90" />
                <span className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-xl" />
                <span className="absolute inset-0 rounded-sm ring-1 ring-[#00f5d4]/50 group-hover:ring-[#6c5ce7]/70" />
                <span className="relative z-10">Start</span>
              </button>

              <button
                onClick={() => setShowHowItWorks(true)}
                className="group relative px-8 py-4 sm:px-10 sm:py-5 font-mono text-xs sm:text-sm tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
              >
                <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300" />
                <span className="relative z-10">How It Works</span>
              </button>
            </div>

            <div className="mt-16 sm:mt-20 flex items-center justify-center gap-6 text-[10px] sm:text-xs font-mono text-[#48485a] tracking-wider uppercase">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#48485a] tracking-wider">
            <span>HandsShooter 2026</span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#00f5d4] animate-pulse" />
              Ready
            </span>
          </div>
        </footer>
      </div>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </div>
  );
}

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080e]/90 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="How It Works"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg mx-6 animate-in fade-in duration-300">
        <div className="absolute -inset-8 bg-gradient-to-r from-[#6c5ce7]/10 via-[#00f5d4]/5 to-[#8833ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full border border-[#00f5d4]/30">
            <svg
              className="w-8 h-8 text-[#00f5d4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-[#e8e8f0] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How It Works
          </h1>

          <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
            <Step number={1} text="Grant camera access when prompted" />
            <Step number={2} text="Pinch your thumb and index finger together" />
            <Step number={3} text="Pull your hand back to charge energy" />
            <Step number={4} text="Release to fire a projectile at enemies" />
          </div>

          <button
            onClick={onClose}
            className="group relative w-full py-4 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
          >
            <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300" />
            <span className="relative z-10">Got It</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6c5ce7]/20 border border-[#6c5ce7]/30 flex items-center justify-center text-[10px] font-mono text-[#6c5ce7] font-bold">
        {number}
      </span>
      <p className="text-sm font-mono text-[#6c6c80] leading-relaxed pt-0.5">
        {text}
      </p>
    </div>
  );
}

function ScanLines() {
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

function GlitchText({ text }: { text: string }) {
  return (
    <div className="relative inline-block">
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
