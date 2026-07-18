import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import LandingScreen from "@/components/screens/LandingScreen";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LandingScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders without crashing and displays HANDSHOOTER heading", async () => {
    const { container } = render(<LandingScreen />);
    const heading = await screen.findByText("HANDSHOOTER");
    expect(heading).toBeDefined();
    expect(container.querySelector("h1")).toBeTruthy();
  });

  it("renders the PLAY button with correct aria-label", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    const playButton = screen.getByLabelText("Play Game");
    expect(playButton).toBeTruthy();
    expect(playButton.textContent).toContain("PLAY");
  });

  it("renders the SETTINGS button with correct aria-label", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    const settingsButton = screen.getByLabelText("Open Settings");
    expect(settingsButton).toBeDefined();
    expect(settingsButton.textContent).toContain("SETTINGS");
  });

  it("does not render the How It Works modal", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    expect(screen.queryByText("How It Works")).toBeNull();
    expect(screen.queryByText("Got It")).toBeNull();
  });

  it("opens SettingsModal on Settings button click", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    screen.getByLabelText("Open Settings").click();
    expect(await screen.findByRole("dialog", { name: "Settings" })).toBeDefined();
    expect(await screen.findByText("Done")).toBeDefined();
  });

  it("closes SettingsModal when Done is clicked", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    screen.getByLabelText("Open Settings").click();
    const doneButton = await screen.findByText("Done");
    doneButton.click();
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders system status indicators", async () => {
    render(<LandingScreen />);
    expect(await screen.findByText("SYSTEM ACTIVE")).toBeDefined();
    expect(await screen.findByText("Camera Required")).toBeDefined();
    expect(await screen.findByText("Local Processing")).toBeDefined();
    expect(await screen.findByText("No Upload")).toBeDefined();
  });

  it("renders the 'REALITY IS BREAKING' glitch text", async () => {
    render(<LandingScreen />);
    const texts = await screen.findAllByText("REALITY IS BREAKING");
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the footer text", async () => {
    render(<LandingScreen />);
    expect(await screen.findByText("HandsShooter 2026")).toBeDefined();
  });

  it("navigates to /game when PLAY is clicked", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    screen.getByLabelText("Play Game").click();
    expect(mockPush).toHaveBeenCalledWith("/game");
  });
});
