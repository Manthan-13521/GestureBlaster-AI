import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GameScreen from "@/components/screens/GameScreen";

vi.mock("@/hooks/useCamera", () => ({
  useCamera: vi.fn(() => ({
    status: "idle" as const,
    videoRef: { current: null },
    error: null,
    requestAccess: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
  })),
}));

vi.mock("@/hooks/useHandTracking", () => ({
  useHandTracking: () => ({
    status: "idle" as const,
    handData: null,
    start: vi.fn(),
    stop: vi.fn(),
  }),
}));

vi.mock("@/hooks/useGameInput", () => ({
  useGameInput: () => ({
    input: {
      isAiming: false,
      isPinching: false,
      origin: null,
      currentPosition: { x: 0, y: 0 },
      pullVector: { x: 0, y: 0 },
      charge: 0,
      released: false,
      cooldown: false,
      handConfidence: 0,
      source: "mouse" as const,
    },
    attach: vi.fn(),
    detach: vi.fn(),
  }),
}));

describe("GameScreen", () => {
  it("renders the permission prompt initially", () => {
    render(<GameScreen />);
    expect(screen.getByText("Camera Required")).toBeDefined();
    expect(screen.getByText("Grant Camera")).toBeDefined();
    expect(screen.getByText("Use Mouse Instead")).toBeDefined();
  });

  it("shows requesting screen when Grant Camera is clicked", async () => {
    render(<GameScreen />);
    screen.getByText("Grant Camera").click();
    expect(await screen.findByText("Requesting Camera")).toBeDefined();
  });

  it("shows playing screen when Use Mouse Instead is clicked", async () => {
    render(<GameScreen />);
    screen.getByText("Use Mouse Instead").click();
    expect(await screen.findByText(/EXIT/i)).toBeDefined();
    expect(screen.getByText("Mouse")).toBeDefined();
  });
});
