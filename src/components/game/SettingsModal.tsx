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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080e]/90 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`relative w-full max-w-xl mx-6 rounded-md bg-[#0a0a14] border border-[#6c5ce7]/30 shadow-2xl overflow-hidden ${settings.accessibility.reducedMotion ? "" : "animate-in fade-in zoom-in-95 duration-200"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6c5ce7]/20 bg-[#08080e]">
          <h2 className="text-xl font-bold text-[#e8e8f0]" style={{ fontFamily: "var(--font-display)" }}>
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="text-[#6c6c80] hover:text-[#e8e8f0] transition-colors p-2"
            aria-label="Close Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#6c5ce7]/20 bg-[#0a0a14]">
          {(["game", "audio", "accessibility"] as SettingsTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-mono tracking-[0.15em] uppercase transition-colors ${
                activeTab === tab
                  ? "text-[#00f5d4] border-b-2 border-[#00f5d4] bg-[#00f5d4]/5"
                  : "text-[#6c6c80] hover:text-[#e8e8f0] hover:bg-[#6c5ce7]/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "game" && (
            <div className="space-y-6">
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
            <div className="space-y-6">
              <ToggleRow
                label="Mute All Sounds"
                description="Disable all game audio."
                checked={settings.audio.muted}
                onChange={(checked) => updateSection("audio", { muted: checked })}
                reducedMotion={settings.accessibility.reducedMotion}
              />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-mono text-[#e8e8f0]">Master Volume</span>
                  <span className="text-sm font-mono text-[#00f5d4]">
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
                  className={`w-full accent-[#00f5d4] ${settings.audio.muted ? "opacity-50" : ""}`}
                />
              </div>
            </div>
          )}

          {activeTab === "accessibility" && (
            <div className="space-y-6">
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
        <div className="p-4 border-t border-[#6c5ce7]/20 bg-[#08080e] flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#08080e] bg-[#00f5d4] hover:bg-[#00f5d4]/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
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
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="text-sm font-mono text-[#e8e8f0]">{label}</div>
        <div className="text-xs font-mono text-[#6c6c80]">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#00f5d4] focus:ring-offset-2 focus:ring-offset-[#0a0a14] ${
          reducedMotion ? "duration-0" : "duration-200"
        } ${checked ? "bg-[#00f5d4]" : "bg-[#48485a]"}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
            reducedMotion ? "duration-0" : "duration-200"
          } ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
