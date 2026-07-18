"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { GameEngine } from "@/engine/game-engine";
import type { EngineEvent } from "@/engine/game-engine";
import type { AimInput } from "@/types/input";
import type { AudioManager } from "@/audio/audio-manager";
import type { EngineStateSnapshot } from "@/engine/types";

interface UseGameEngineOptions {
  gameCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fxCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  input: AimInput;
  audioManager: AudioManager;
  running: boolean;
  width: number;
  height: number;
  /** Optional second subscriber — receives every engine event after audio is handled */
  onEngineEvent?: (event: EngineEvent) => void;
}

const defaultState: EngineStateSnapshot = {
  score: 0,
  kills: 0,
  wave: 1,
  sessionTime: 0,
  hp: 100,
  maxHp: 100,
  gameOver: false,
  weaponLevel: 1,
  monsterCount: 0,
  highScore: 0,
};

export function useGameEngine({
  gameCanvasRef,
  fxCanvasRef,
  input,
  audioManager,
  running,
  width,
  height,
  onEngineEvent,
}: UseGameEngineOptions) {
  // Keep the callback in a ref so changes never force the engine loop to restart
  const onEngineEventRef = useRef(onEngineEvent);
  useEffect(() => { onEngineEventRef.current = onEngineEvent; }, [onEngineEvent]);
  const engineRef = useRef<GameEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const inputRef = useRef(input);
  const stateRef = useRef<EngineStateSnapshot>(defaultState);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    widthRef.current = width;
    heightRef.current = height;
  }, [width, height]);

  const restart = useCallback(() => {
    setRestartKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!running) {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
      return;
    }

    if (engineRef.current) {
      engineRef.current.cleanup();
      engineRef.current = null;
    }

    const engine = new GameEngine();
    engineRef.current = engine;
    stateRef.current = defaultState;

    const dpr = window.devicePixelRatio || 1;
    for (const ref of [gameCanvasRef, fxCanvasRef]) {
      const canvas = ref.current;
      if (!canvas) continue;
      canvas.width = widthRef.current * dpr;
      canvas.height = heightRef.current * dpr;
      canvas.style.width = `${widthRef.current}px`;
      canvas.style.height = `${heightRef.current}px`;
    }

    engine.onEvent = (event) => {
      // Audio handling
      switch (event.type) {
        case "fire":
          audioManager.playLaunchSweep();
          break;
        case "hit":
          audioManager.playImpact("stagger");
          break;
        case "kill":
          audioManager.playImpact("defeat");
          break;
        case "damage":
          if (event.hp <= 0) {
            audioManager.playGameOver?.();
          } else {
            audioManager.playLifeLost?.();
          }
          break;
        case "weaponUpgrade":
          audioManager.playWaveTransition();
          break;
      }
      // Secondary subscriber (tutorial, analytics, etc.)
      onEngineEventRef.current?.(event);
    };

    let lastTime = performance.now();
    runningRef.current = true;

    const loop = (now: number) => {
      if (!runningRef.current) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const currentInput = inputRef.current;
      const w = widthRef.current;
      const h = heightRef.current;

      const dpr = window.devicePixelRatio || 1;
      const targetW = w * dpr;
      const targetH = h * dpr;

      for (const ref of [gameCanvasRef, fxCanvasRef]) {
        const canvas = ref.current;
        if (canvas) {
          if (canvas.width !== targetW) canvas.width = targetW;
          if (canvas.height !== targetH) canvas.height = targetH;
          if (canvas.style.width !== `${w}px`) canvas.style.width = `${w}px`;
          if (canvas.style.height !== `${h}px`) canvas.style.height = `${h}px`;
        }
      }

      engine.handleInput(currentInput, dt);
      engine.update(dt);

      const state = engine.getState();
      stateRef.current = state;

      const gameCtx = gameCanvasRef.current?.getContext("2d");
      const fxCtx = fxCanvasRef.current?.getContext("2d");

      if (gameCtx) engine.renderGame(gameCtx, w, h);
      if (fxCtx) engine.renderFX(fxCtx, w, h);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [running, gameCanvasRef, fxCanvasRef, audioManager, restartKey]);

  return { stateRef, restart };
}
