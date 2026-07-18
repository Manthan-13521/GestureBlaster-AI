export type TutorialStep = "pinch" | "release" | "hit" | "complete";

export interface TutorialState {
  active: boolean;
  step: TutorialStep;
  completed: boolean;
}
