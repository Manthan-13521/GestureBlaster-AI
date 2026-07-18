import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress noisy Mediapipe WASM browser logs from appearing in the terminal
  logging: {
    fetches: {
      fullUrl: false,
      hmrRefreshes: false,
    },
  },
};

export default nextConfig;
