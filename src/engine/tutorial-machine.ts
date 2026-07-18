import type { TutorialState } from "@/types/tutorial";

// ---------------------------------------------------------------------------
// Pure state machine — no React, no side-effects, fully unit-testable
// ---------------------------------------------------------------------------

export type TutorialEvent = "pinch" | "fire" | "hit";

const INITIAL_STATE: TutorialState = {
  active: true,
  step: "pinch",
  completed: false,
};

/**
 * Returns the next TutorialState given the current state and an incoming event.
 * This is a pure function: same inputs always produce the same output.
 */
export function tutorialReducer(
  state: TutorialState,
  event: TutorialEvent,
): TutorialState {
  // Completed tutorials never transition further
  if (state.completed || !state.active) return state;

  switch (state.step) {
    case "pinch":
      if (event === "pinch") {
        return { ...state, step: "release" };
      }
      return state;

    case "release":
      if (event === "fire") {
        return { ...state, step: "hit" };
      }
      return state;

    case "hit":
      if (event === "hit") {
        return { active: false, step: "complete", completed: true };
      }
      return state;

    case "complete":
      return state;

    default:
      return state;
  }
}

/**
 * Creates a mutable tutorial controller suitable for use inside a React ref.
 * The controller holds state externally so it can be updated from the engine
 * event callback without triggering re-renders on every frame.
 */
export class TutorialController {
  private _state: TutorialState = { ...INITIAL_STATE };
  private _onChange: ((state: TutorialState) => void) | null = null;

  get state(): TutorialState {
    return this._state;
  }

  onStateChange(cb: (state: TutorialState) => void): void {
    this._onChange = cb;
  }

  dispatch(event: TutorialEvent): void {
    const next = tutorialReducer(this._state, event);
    if (next !== this._state) {
      this._state = next;
      this._onChange?.(next);
    }
  }

  reset(): void {
    this._state = { ...INITIAL_STATE };
    this._onChange?.(this._state);
  }
}
