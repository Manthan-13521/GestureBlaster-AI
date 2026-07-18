import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PermissionPrompt from "@/components/game/PermissionPrompt";

describe("PermissionPrompt", () => {
  it("renders the camera required heading", () => {
    render(
      <PermissionPrompt onGrantCamera={vi.fn()} onUseMouse={vi.fn()} />,
    );
    expect(screen.getByText("Camera Required")).toBeDefined();
  });

  it("renders the Grant Camera button", () => {
    render(
      <PermissionPrompt onGrantCamera={vi.fn()} onUseMouse={vi.fn()} />,
    );
    expect(screen.getByText("Grant Camera")).toBeDefined();
  });

  it("renders the Use Mouse Instead button", () => {
    render(
      <PermissionPrompt onGrantCamera={vi.fn()} onUseMouse={vi.fn()} />,
    );
    expect(screen.getByText("Use Mouse Instead")).toBeDefined();
  });

  it("calls onGrantCamera when Grant Camera is clicked", () => {
    const onGrant = vi.fn();
    render(<PermissionPrompt onGrantCamera={onGrant} onUseMouse={vi.fn()} />);
    screen.getByText("Grant Camera").click();
    expect(onGrant).toHaveBeenCalledOnce();
  });

  it("calls onUseMouse when Use Mouse Instead is clicked", () => {
    const onMouse = vi.fn();
    render(<PermissionPrompt onGrantCamera={vi.fn()} onUseMouse={onMouse} />);
    screen.getByText("Use Mouse Instead").click();
    expect(onMouse).toHaveBeenCalledOnce();
  });

  it("shows local processing badges", () => {
    render(
      <PermissionPrompt onGrantCamera={vi.fn()} onUseMouse={vi.fn()} />,
    );
    expect(screen.getByText("Local")).toBeDefined();
    expect(screen.getByText("No Upload")).toBeDefined();
    expect(screen.getByText("HTTPS Required")).toBeDefined();
  });
});
