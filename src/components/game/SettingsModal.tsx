"use client";

import { useState, useEffect } from "react";
import { useGameSettings } from "@/hooks/useGameSettings";
import type { SettingsTab } from "@/types/settings";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("game");
  const { settings, updateSection } = useGameSettings();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080e]/80 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`relative w-full max-w-xl mx-6 rounded-2xl bg-[#08080e]/80 border border-[#ffffff10] shadow-[0_16px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl ${settings.accessibility.reducedMotion ? "" : "animate-in fade-in zoom-in-95 duration-200"}`}>
        
        {/* Glow behind modal */}
        <div className="absolute -inset-4 bg-gradient-to-br from-[#6c5ce7]/20 to-[#00f5d4]/10 opacity-30 rounded-full blur-3xl pointer-events-none" />

        {/* Corner Brackets */}
        <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00f5d4]/40 rounded-tl-2xl" />
        <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00f5d4]/40 rounded-tr-2xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-8 py-5 border-b border-[#ffffff10] bg-gradient-to-b from-[#ffffff08] to-transparent">
          <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-[#e8e8f0]" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="text-[#6c6c80] hover:text-[#00f5d4] transition-colors p-2 rounded-full hover:bg-[#ffffff0a]"
            aria-label="Close Settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="relative flex border-b border-[#ffffff10] bg-[#00000020]">
          {(["game", "audio", "accessibility"] as SettingsTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-xs font-bold font-mono tracking-[0.2em] uppercase transition-all duration-200 ${
                activeTab === tab
                  ? "text-[#00f5d4] border-b-2 border-[#00f5d4] bg-[#00f5d4]/10"
                  : "text-[#6c6c80] hover:text-[#e8e8f0] hover:bg-[#ffffff05]"
              }`}
              style={activeTab === tab ? { textShadow: "0 0 10px rgba(0,245,212,0.5)" } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="relative p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeTab === "game" && (
            <div className="space-y-8">
              <ToggleRow
                label="Pause on Focus Lost"
                description="Automatically pause the game when switching tabs or apps."
                checked={settings.game.pauseOnFocusLost}
                onChange={(checked) => updateSection("game", { pauseOnFocusLost: checked })}
                reducedMotion={settings.accessibility.reducedMotion}
              />
              <ToggleRow
                label="Tutorial Enabled"
                description="Show the tutorial wave on first run."
                checked={settings.game.tutorialEnabled}
                onChange={(checked) => updateSection("game", { tutorialEnabled: checked })}
                reducedMotion={settings.accessibility.reducedMotion}
              />
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-8">
              <ToggleRow
                label="Mute All Sounds"
                description="Disable all game audio."
                checked={settings.audio.muted}
                onChange={(checked) => updateSection("audio", { muted: checked })}
                reducedMotion={settings.accessibility.reducedMotion}
              />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono tracking-widest uppercase text-[#e8e8f0]">Master Volume</span>
                  <span className="text-sm font-bold font-mono text-[#00f5d4] px-3 py-1 bg-[#00f5d4]/10 rounded-sm border border-[#00f5d4]/20" style={{ textShadow: "0 0 10px rgba(0,245,212,0.5)" }}>
                    {Math.round(settings.audio.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.audio.masterVolume}
                  onChange={(e) => updateSection("audio", { masterVolume: parseFloat(e.target.value) })}
                  disabled={settings.audio.muted}
                  className={`w-full h-2 rounded-full appearance-none bg-[#ffffff10] outline-none transition-opacity ${settings.audio.muted ? "opacity-50" : ""}`}
                  style={{
                    accentColor: "#00f5d4",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)"
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "accessibility" && (
            <div className="space-y-8">
              <ToggleRow
                label="Reduced Motion"
                description="Disable screen shakes, camera kicks, and UI scaling animations."
                checked={settings.accessibility.reducedMotion}
                onChange={(checked) => updateSection("accessibility", { reducedMotion: checked })}
                reducedMotion={settings.accessibility.reducedMotion}
              />
              <ToggleRow
                label="High Contrast UI"
                description="Increase contrast for text and important HUD elements."
                checked={settings.accessibility.highContrastUi}
                onChange={(checked) => updateSection("accessibility", { highContrastUi: checked })}
                reducedMotion={settings.accessibility.reducedMotion}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-6 border-t border-[#ffffff10] bg-[#00000040] flex justify-end">
          <button
            onClick={onClose}
            className="group relative flex items-center justify-center px-10 py-3 rounded-sm font-display text-xs font-bold tracking-[0.25em] uppercase text-[#08080e] cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="absolute inset-0 bg-[#00f5d4] rounded-sm transition-all duration-300 group-hover:bg-[#00f5d4]" />
            <span className="absolute inset-0 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300 bg-[#00f5d4] blur-md" />
            <span className="relative z-10">DONE</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,245,212,0.5); }
      `}</style>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  reducedMotion,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  reducedMotion: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="space-y-1.5 flex-1">
        <div className="text-sm font-bold font-mono tracking-widest uppercase text-[#e8e8f0]">{label}</div>
        <div className="text-xs font-mono text-[#6c6c80] leading-relaxed">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#00f5d4] focus:ring-offset-2 focus:ring-offset-[#08080e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] ${
          reducedMotion ? "duration-0" : "duration-300 ease-in-out"
        } ${checked ? "bg-[#00f5d4]" : "bg-[#1a1a2e]"}`}
        style={checked ? { boxShadow: "0 0 15px rgba(0,245,212,0.4), inset 0 2px 4px rgba(0,0,0,0.5)" } : {}}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
            reducedMotion ? "duration-0" : "duration-300 ease-bounce"
          } ${checked ? "translate-x-7" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
