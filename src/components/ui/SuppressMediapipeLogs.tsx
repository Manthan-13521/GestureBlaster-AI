"use client";

import { useEffect } from "react";

// Known noisy patterns from Mediapipe WebAssembly binary — suppress from console
const NOISE_PATTERNS = [
  "OpenGL error checking is disabled",
  "Created TensorFlow Lite XNNPACK delegate",
  "Feedback manager requires a model with a single signature",
  "Disabling support for feedback tensors",
  "Using NORM_RECT without IMAGE_DIMENSIONS",
  "landmark_projection_calculator",
  "inference_feedback_manager",
  "gl_context.cc",
  "vision_wasm",
  "NORM_RECT",
  "IMAGE_DIMENSIONS",
];

function isMediapipeNoise(args: unknown[]): boolean {
  return args.some(
    (a) =>
      typeof a === "string" &&
      NOISE_PATTERNS.some((p) => a.includes(p))
  );
}

// Patch immediately at module evaluation time so we catch logs
// that fire during WASM initialization before React renders
const originalConsoleWarn = console.warn.bind(console);
const originalConsoleInfo = console.info.bind(console);
const originalConsoleLog = console.log.bind(console);
const originalConsoleError = console.error.bind(console);

console.warn = (...args: unknown[]) => {
  if (isMediapipeNoise(args)) return;
  originalConsoleWarn(...args);
};
console.info = (...args: unknown[]) => {
  if (isMediapipeNoise(args)) return;
  originalConsoleInfo(...args);
};
console.log = (...args: unknown[]) => {
  if (isMediapipeNoise(args)) return;
  originalConsoleLog(...args);
};
console.error = (...args: unknown[]) => {
  if (isMediapipeNoise(args)) return;
  originalConsoleError(...args);
};

export default function SuppressMediapipeLogs() {
  // Component exists to ensure this module is imported and executed
  // The actual patching happens above at module scope
  useEffect(() => {
    return () => {
      // Restore originals on unmount
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
