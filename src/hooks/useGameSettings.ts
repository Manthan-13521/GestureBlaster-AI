import { useSyncExternalStore } from 'react';
import type { GameSettings } from '@/types/settings';

const DEFAULT_SETTINGS: GameSettings = {
  game: {
    pauseOnFocusLost: true,
    tutorialEnabled: true,
  },
  audio: {
    masterVolume: 1.0,
    muted: false,
  },
  accessibility: {
    reducedMotion: false,
    highContrastUi: false,
  },
};

// Session-based store for now
let currentSettings: GameSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const SettingsStore = {
  getSnapshot: () => currentSettings,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  update: (updater: (prev: GameSettings) => Partial<GameSettings> | GameSettings) => {
    const next = updater(currentSettings);
    // Deep merge for nested properties
    currentSettings = {
      game: { ...currentSettings.game, ...(next.game || {}) },
      audio: { ...currentSettings.audio, ...(next.audio || {}) },
      accessibility: { ...currentSettings.accessibility, ...(next.accessibility || {}) },
    };
    notify();
  },
  updateSection: <K extends keyof GameSettings>(section: K, values: Partial<GameSettings[K]>) => {
    currentSettings = {
      ...currentSettings,
      [section]: {
        ...currentSettings[section],
        ...values,
      },
    };
    notify();
  },
  reset: () => {
    currentSettings = { ...DEFAULT_SETTINGS };
    notify();
  },
};

export function useGameSettings() {
  const settings = useSyncExternalStore(SettingsStore.subscribe, SettingsStore.getSnapshot, SettingsStore.getSnapshot);

  return {
    settings,
    updateSettings: SettingsStore.update,
    updateSection: SettingsStore.updateSection,
    resetSettings: SettingsStore.reset,
  };
}
