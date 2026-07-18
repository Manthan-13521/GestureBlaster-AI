import { describe, it, expect, vi } from "vitest";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import LandingScreen from "@/components/screens/LandingScreen";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LandingScreen", () => {
  it("renders without crashing and displays HANDSHOOTER heading", async () => {
    const { container } = render(<LandingScreen />);
    const heading = await screen.findByText("HANDSHOOTER");
    expect(heading).toBeDefined();
    expect(container.querySelector("h1")).toBeTruthy();
  });

  it("renders the Start button", async () => {
    const { container } = render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    const startButton = container.querySelector("button");
    expect(startButton).toBeTruthy();
    expect(startButton?.textContent).toContain("Start");
  });

  it("renders the How It Works button", async () => {
    render(<LandingScreen />);
    const howItWorks = await screen.findByText("How It Works");
    expect(howItWorks).toBeDefined();
  });

  it("opens How It Works modal on button click", async () => {
    const { container } = render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    const howItWorksBtn = screen.getByText("How It Works");
    howItWorksBtn.click();
    expect(await screen.findByText("Got It")).toBeDefined();
    expect(container.textContent).toContain("Grant camera access when prompted");
  });

  it("closes How It Works modal when Got It is clicked", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    screen.getByText("How It Works").click();
    const gotIt = await screen.findByText("Got It");
    expect(gotIt).toBeDefined();
    gotIt.click();
    await waitForElementToBeRemoved(() => screen.queryByText("Got It"));
    expect(screen.queryByText("Got It")).toBeNull();
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

  it("navigates to /game when Start is clicked", async () => {
    render(<LandingScreen />);
    await screen.findByText("HANDSHOOTER");
    const buttons = screen.getAllByText("Start");
    buttons[0].click();
    expect(mockPush).toHaveBeenCalledWith("/game");
  });
});
