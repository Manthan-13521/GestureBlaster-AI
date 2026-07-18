import { describe, it, expect } from "vitest";
import { tutorialReducer, TutorialController } from "@/engine/tutorial-machine";
import type { TutorialState } from "@/types/tutorial";

const INITIAL: TutorialState = { active: true, step: "pinch", completed: false };

describe("tutorialReducer", () => {
  // ------- Happy path -------
  it("initial state is pinch", () => {
    expect(INITIAL.step).toBe("pinch");
    expect(INITIAL.active).toBe(true);
    expect(INITIAL.completed).toBe(false);
  });

  it("pinch event advances pinch → release", () => {
    const next = tutorialReducer(INITIAL, "pinch");
    expect(next.step).toBe("release");
    expect(next.active).toBe(true);
    expect(next.completed).toBe(false);
  });

  it("fire event advances release → hit", () => {
    const inRelease: TutorialState = { active: true, step: "release", completed: false };
    const next = tutorialReducer(inRelease, "fire");
    expect(next.step).toBe("hit");
  });

  it("hit event completes the tutorial", () => {
    const inHit: TutorialState = { active: true, step: "hit", completed: false };
    const next = tutorialReducer(inHit, "hit");
    expect(next.step).toBe("complete");
    expect(next.completed).toBe(true);
    expect(next.active).toBe(false);
  });

  // ------- Out-of-order guards -------
  it("fire event before pinch does not advance tutorial", () => {
    const next = tutorialReducer(INITIAL, "fire");
    expect(next.step).toBe("pinch");
  });

  it("hit event before pinch does not advance tutorial", () => {
    const next = tutorialReducer(INITIAL, "hit");
    expect(next.step).toBe("pinch");
  });

  it("hit event before fire (in release step) does not advance tutorial", () => {
    const inRelease: TutorialState = { active: true, step: "release", completed: false };
    const next = tutorialReducer(inRelease, "hit");
    expect(next.step).toBe("release");
  });

  it("pinch event after already completing release step is ignored", () => {
    const inRelease: TutorialState = { active: true, step: "release", completed: false };
    const next = tutorialReducer(inRelease, "pinch");
    expect(next.step).toBe("release");
  });

  // ------- Completion guards -------
  it("completed tutorial ignores pinch event", () => {
    const completed: TutorialState = { active: false, step: "complete", completed: true };
    const next = tutorialReducer(completed, "pinch");
    expect(next).toBe(completed); // same reference — no state change
  });

  it("completed tutorial ignores fire event", () => {
    const completed: TutorialState = { active: false, step: "complete", completed: true };
    const next = tutorialReducer(completed, "fire");
    expect(next).toBe(completed);
  });

  it("completed tutorial ignores hit event", () => {
    const completed: TutorialState = { active: false, step: "complete", completed: true };
    const next = tutorialReducer(completed, "hit");
    expect(next).toBe(completed);
  });

  // ------- Inactive guard -------
  it("inactive (non-completed) tutorial ignores all events", () => {
    const inactive: TutorialState = { active: false, step: "pinch", completed: false };
    expect(tutorialReducer(inactive, "pinch")).toBe(inactive);
    expect(tutorialReducer(inactive, "fire")).toBe(inactive);
    expect(tutorialReducer(inactive, "hit")).toBe(inactive);
  });
});

describe("TutorialController", () => {
  it("starts in pinch step", () => {
    const ctrl = new TutorialController();
    expect(ctrl.state.step).toBe("pinch");
    expect(ctrl.state.active).toBe(true);
    expect(ctrl.state.completed).toBe(false);
  });

  it("dispatching events advances state correctly", () => {
    const ctrl = new TutorialController();
    ctrl.dispatch("pinch");
    expect(ctrl.state.step).toBe("release");
    ctrl.dispatch("fire");
    expect(ctrl.state.step).toBe("hit");
    ctrl.dispatch("hit");
    expect(ctrl.state.step).toBe("complete");
    expect(ctrl.state.completed).toBe(true);
  });

  it("calls onChange callback on state transition", () => {
    const ctrl = new TutorialController();
    const changes: string[] = [];
    ctrl.onStateChange((s) => changes.push(s.step));
    ctrl.dispatch("pinch");
    ctrl.dispatch("fire");
    expect(changes).toEqual(["release", "hit"]);
  });

  it("does not call onChange when state does not change", () => {
    const ctrl = new TutorialController();
    let count = 0;
    ctrl.onStateChange(() => count++);
    ctrl.dispatch("fire"); // wrong order — should not advance
    expect(count).toBe(0);
  });

  it("reset returns controller to initial pinch state", () => {
    const ctrl = new TutorialController();
    ctrl.dispatch("pinch");
    ctrl.dispatch("fire");
    ctrl.dispatch("hit");
    expect(ctrl.state.completed).toBe(true);
    ctrl.reset();
    expect(ctrl.state.step).toBe("pinch");
    expect(ctrl.state.active).toBe(true);
    expect(ctrl.state.completed).toBe(false);
  });
});
