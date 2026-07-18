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
];

function isMediapipeNoise(args: unknown[]): boolean {
  return args.some(
    (a) =>
      typeof a === "string" &&
      NOISE_PATTERNS.some((p) => a.includes(p))
  );
}

export default function SuppressMediapipeLogs() {
  useEffect(() => {
    const originalWarn = console.warn.bind(console);
    const originalInfo = console.info.bind(console);
    const originalLog = console.log.bind(console);

    console.warn = (...args: unknown[]) => {
      if (isMediapipeNoise(args)) return;
      originalWarn(...args);
    };
    console.info = (...args: unknown[]) => {
      if (isMediapipeNoise(args)) return;
      originalInfo(...args);
    };
    console.log = (...args: unknown[]) => {
      if (isMediapipeNoise(args)) return;
      originalLog(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.info = originalInfo;
      console.log = originalLog;
    };
  }, []);

  return null;
}
