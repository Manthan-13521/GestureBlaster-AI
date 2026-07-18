import { describe, it, expect, vi, beforeEach } from "vitest";
import { CameraManager } from "@/input/camera-manager";

function mockGetUserMedia(
  result: "success" | "denied" | "notfound" | "error",
) {
  const mockStream = {
    getTracks: () => [
      { stop: vi.fn() },
    ],
  } as unknown as MediaStream;

  const mockVideo = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    srcObject: null,
    remove: vi.fn(),
    addEventListener: vi.fn(),
    setAttribute: vi.fn(),
    style: {} as CSSStyleDeclaration,
  } as unknown as HTMLVideoElement;

  document.createElement = vi.fn().mockReturnValue(mockVideo);

  switch (result) {
    case "success":
      navigator.mediaDevices = {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      } as unknown as MediaDevices;
      break;
    case "denied":
      const deniedErr = new DOMException("Permission denied", "NotAllowedError");
      navigator.mediaDevices = {
        getUserMedia: vi.fn().mockRejectedValue(deniedErr),
      } as unknown as MediaDevices;
      break;
    case "notfound":
      const notFoundErr = new DOMException("Not found", "NotFoundError");
      navigator.mediaDevices = {
        getUserMedia: vi.fn().mockRejectedValue(notFoundErr),
      } as unknown as MediaDevices;
      break;
    case "error":
      navigator.mediaDevices = {
        getUserMedia: vi.fn().mockRejectedValue(new Error("Generic error")),
      } as unknown as MediaDevices;
      break;
  }
}

describe("CameraManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigator.mediaDevices = {} as MediaDevices;
  });

  it("reports idle status initially", () => {
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    expect(manager.getStatus()).toBe("idle");
    expect(manager.getStream()).toBeNull();
    expect(manager.getVideo()).toBeNull();
  });

  it("is not supported when mediaDevices is missing", () => {
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    expect(manager.isSupported()).toBe(false);
  });

  it("is supported when mediaDevices.getUserMedia exists", () => {
    navigator.mediaDevices = { getUserMedia: vi.fn() } as unknown as MediaDevices;
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    expect(manager.isSupported()).toBe(true);
  });

  it("transitions to ready on successful camera access", async () => {
    mockGetUserMedia("success");
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    const callback = vi.fn();
    await manager.requestAccess(callback);
    expect(manager.getStatus()).toBe("ready");
    expect(callback).toHaveBeenCalledWith("ready");
    expect(manager.getStream()).not.toBeNull();
    expect(manager.getVideo()).not.toBeNull();
  });

  it("transitions to denied on permission denial", async () => {
    mockGetUserMedia("denied");
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    const callback = vi.fn();
    await expect(manager.requestAccess(callback)).rejects.toThrow();
    expect(manager.getStatus()).toBe("denied");
    expect(callback).toHaveBeenCalledWith("denied", "Camera permission denied");
  });

  it("transitions to unsupported when no camera found", async () => {
    mockGetUserMedia("notfound");
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    const callback = vi.fn();
    await expect(manager.requestAccess(callback)).rejects.toThrow();
    expect(manager.getStatus()).toBe("unsupported");
    expect(callback).toHaveBeenCalledWith("unsupported", "No camera found");
  });

  it("transitions to error on generic camera error", async () => {
    mockGetUserMedia("error");
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    const callback = vi.fn();
    await expect(manager.requestAccess(callback)).rejects.toThrow();
    expect(manager.getStatus()).toBe("error");
    expect(callback).toHaveBeenCalled();
  });

  it("stops camera and cleans up", async () => {
    mockGetUserMedia("success");
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    await manager.requestAccess();
    expect(manager.getStatus()).toBe("ready");
    manager.stop();
    expect(manager.getStatus()).toBe("idle");
    expect(manager.getStream()).toBeNull();
    expect(manager.getVideo()).toBeNull();
  });

  it("calls status callback during request flow", async () => {
    mockGetUserMedia("success");
    const manager = new CameraManager({ width: 640, height: 480, facingMode: "user" });
    const callback = vi.fn();
    await manager.requestAccess(callback);
    expect(callback).toHaveBeenCalledWith("requesting");
    expect(callback).toHaveBeenCalledWith("ready");
  });
});
