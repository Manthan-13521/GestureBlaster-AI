export interface GameSettings {
  game: {
    pauseOnFocusLost: boolean;
    tutorialEnabled: boolean;
  };
  audio: {
    masterVolume: number;
    muted: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrastUi: boolean;
  };
}

export type SettingsTab = "game" | "audio" | "accessibility";
