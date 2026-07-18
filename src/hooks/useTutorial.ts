"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { TutorialController } from "@/engine/tutorial-machine";
import type { TutorialState } from "@/types/tutorial";
import type { EngineEvent } from "@/engine/game-engine";

const INITIAL_STATE: TutorialState = {
  active: true,
  step: "pinch",
  completed: false,
};

export interface UseTutorialReturn {
  tutorialState: TutorialState;
  /** Call this from the engine's onEvent handler */
  handleEngineEvent: (event: EngineEvent) => void;
  /** Call this each frame when isPinching becomes true */
  handlePinch: () => void;
  reset: () => void;
  /** Whether the tutorial is enabled in the first place */
  enabled: boolean;
}

export function useTutorial(enabled: boolean): UseTutorialReturn {
  const [tutorialState, setTutorialState] = useState<TutorialState>(INITIAL_STATE);

  // Initialize the controller once; store it in a ref that is only written once.
  // We use a separate initRef guard to satisfy the react-hooks/refs rule
  // (ref.current must not be accessed during render).
  const controllerRef = useRef<TutorialController | null>(null);

  useEffect(() => {
    // Create the controller exactly once after mount
    if (controllerRef.current) return;
    const ctrl = new TutorialController();
    ctrl.onStateChange((s) => setTutorialState(s));
    controllerRef.current = ctrl;
  }, []);

  const handlePinch = useCallback(() => {
    if (!enabled) return;
    controllerRef.current?.dispatch("pinch");
  }, [enabled]);

  const handleEngineEvent = useCallback(
    (event: EngineEvent) => {
      if (!enabled) return;
      const ctrl = controllerRef.current;
      if (!ctrl) return;

      switch (event.type) {
        case "fire":
          ctrl.dispatch("fire");
          break;
        case "hit":
        case "kill":
          ctrl.dispatch("hit");
          break;
      }
    },
    [enabled],
  );

  const reset = useCallback(() => {
    controllerRef.current?.reset();
  }, []);

  return { tutorialState, handleEngineEvent, handlePinch, reset, enabled };
}
