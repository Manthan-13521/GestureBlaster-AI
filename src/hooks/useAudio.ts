"use client";

import { useRef, useCallback, useState } from "react";
import { AudioManager } from "@/audio/audio-manager";

export function useAudio() {
  const audioRef = useRef<AudioManager | null>(null);
  const [muted, setMuted] = useState(false);

  const getManager = useCallback((): AudioManager => {
    if (!audioRef.current) {
      audioRef.current = new AudioManager();
    }
    return audioRef.current;
  }, []);

  const ensureInitialized = useCallback(() => {
    const mgr = getManager();
    mgr.resume();
    return mgr;
  }, [getManager]);

  const setVolume = useCallback((v: number) => {
    getManager().setVolume(v);
  }, [getManager]);

  const toggleMute = useCallback(() => {
    const mgr = getManager();
    mgr.toggleMute();
    setMuted(mgr.muted);
  }, [getManager]);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.cleanup();
      audioRef.current = null;
    }
    setMuted(false);
  }, []);

  return { getManager: ensureInitialized, setVolume, toggleMute, muted, cleanup };
}
