"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GameScreenState } from "@/types/common";
import PermissionPrompt from "@/components/game/PermissionPrompt";
import GameCanvas from "@/components/game/GameCanvas";
import HUD from "@/components/game/HUD";
import GameOverOverlay from "@/components/game/GameOverOverlay";
import WaveAnnouncement from "@/components/game/WaveAnnouncement";
import TutorialPrompt from "@/components/game/TutorialPrompt";
import CalibrationScreen from "@/components/calibration/CalibrationScreen";
import { useCamera } from "@/hooks/useCamera";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useCalibration } from "@/hooks/useCalibration";
import { useGameInput } from "@/hooks/useGameInput";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useAudio } from "@/hooks/useAudio";
import { useTutorial } from "@/hooks/useTutorial";
import { useGameSettings } from "@/hooks/useGameSettings";
import { CoordinateMapper } from "@/input/coordinate-mapper";

export default function GameScreen() {
  const [screenState, setScreenState] = useState<GameScreenState>("permission");
  const [inputMode, setInputMode] = useState<"hand" | "mouse">("mouse");
  const [hasVideo, setHasVideo] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const coordMapperRef = useRef<CoordinateMapper | null>(null);
  const audioInitializedRef = useRef(false);

  const { settings } = useGameSettings();
  const { reducedMotion, highContrastUi } = settings.accessibility;

  const { status: cameraStatus, videoRef: cameraVideoRef, error: cameraError, requestAccess, stop: stopCamera } = useCamera();
  const { handData, start: startTracking, stop: stopTracking } = useHandTracking();

  const { state: calibrationState, reset: resetCalibration } = useCalibration(handData);

  const [mapperForInput, setMapperForInput] = useState<CoordinateMapper | null>(null);

  const { input, attach: attachInput, detach: detachInput } = useGameInput({
    inputMode,
    handData,
    coordinateMapper: mapperForInput,
    width: dimensions.width || (typeof window !== "undefined" ? window.innerWidth : 0),
    height: dimensions.height || (typeof window !== "undefined" ? window.innerHeight : 0),
  });

  const { getManager: getAudio, cleanup: cleanupAudio, muted, toggleMute } = useAudio();
  const audioManager = getAudio();

  const tutorial = useTutorial(settings.game.tutorialEnabled);

  const { stateRef, restart } = useGameEngine({
    gameCanvasRef,
    fxCanvasRef,
    input,
    audioManager,
    running: screenState === "playing",
    width: dimensions.width || (typeof window !== "undefined" ? window.innerWidth : 0),
    height: dimensions.height || (typeof window !== "undefined" ? window.innerHeight : 0),
    onEngineEvent: tutorial.handleEngineEvent,
  });

  useEffect(() => {
    if (cameraStatus !== "ready" || !cameraVideoRef.current) return;

    if (!audioInitializedRef.current) {
      getAudio();
      audioInitializedRef.current = true;
    }

    const video = cameraVideoRef.current;
    video.style.display = "none";
    document.body.appendChild(video);
    startTracking(video);
    setHasVideo(true);

    const mapper = new CoordinateMapper(
      { width: 640, height: 480 },
      { width: window.innerWidth, height: window.innerHeight },
    );
    coordMapperRef.current = mapper;
    setMapperForInput(mapper);

    const handleResize = () => {
      coordMapperRef.current?.resize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      stopTracking();
      coordMapperRef.current = null;
      setMapperForInput(null);
    };
  }, [cameraStatus, cameraVideoRef, startTracking, stopTracking, getAudio]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (screenState === "playing" && containerRef.current) {
      attachInput(containerRef.current);
    }
    if (screenState !== "playing") {
      detachInput();
    }
  }, [screenState, attachInput, detachInput]);

  // Signal pinch to tutorial when input becomes active
  useEffect(() => {
    if (screenState === "playing" && input.isActive) {
      tutorial.handlePinch();
    }
  }, [input.isActive, screenState, tutorial]);

  // Reset tutorial on restart
  const handleRestart = useCallback(() => {
    tutorial.reset();
    restart();
  }, [restart, tutorial]);

  const handleGrantCamera = useCallback(async () => {
    setScreenState("requesting");
    getAudio();
    await requestAccess();
  }, [requestAccess, getAudio]);

  const handleUseMouse = useCallback(() => {
    stopTracking();
    stopCamera();
    setHasVideo(false);
    getAudio();
    setInputMode("mouse");
    setScreenState("playing");
  }, [stopTracking, stopCamera, getAudio]);

  const handleRetryCamera = useCallback(async () => {
    setScreenState("requesting");
    stopCamera();
    getAudio();
    await requestAccess();
  }, [requestAccess, stopCamera, getAudio]);

  const handleFallbackToMouse = useCallback(() => {
    stopTracking();
    stopCamera();
    setHasVideo(false);
    getAudio();
    setInputMode("mouse");
    setScreenState("playing");
  }, [stopTracking, stopCamera, getAudio]);

  const handleBack = useCallback(() => {
    setScreenState("permission");
  }, []);

  const handleCalibrated = useCallback(() => {
    getAudio();
    setScreenState("playing");
  }, [getAudio]);

  const handleSkipCalibration = useCallback(() => {
    stopTracking();
    stopCamera();
    setHasVideo(false);
    resetCalibration();
    getAudio();
    setInputMode("mouse");
    setScreenState("playing");
  }, [stopTracking, stopCamera, resetCalibration, getAudio]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (cameraStatus === "ready") {
      setInputMode("hand");
      setScreenState("calibrating");
    } else if (cameraStatus === "denied" || cameraStatus === "unsupported" || cameraStatus === "error") {
      setScreenState("camera-error");
    }
  }, [cameraStatus]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const videoEl = cameraVideoRef.current;
    return () => {
      stopCamera();
      stopTracking();
      detachInput();
      resetCalibration();
      cleanupAudio();
      if (videoEl) {
        videoEl.remove();
      }
    };
  }, [stopCamera, stopTracking, detachInput, resetCalibration, cleanupAudio, cameraVideoRef]);

  if (screenState === "calibrating") {
    return (
      <CalibrationScreen
        calibrationState={calibrationState}
        handData={handData}
        onCalibrated={handleCalibrated}
        onSkipToMouse={handleSkipCalibration}
        onBack={handleBack}
      />
    );
  }

  if (screenState === "playing") {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 bg-[#08080e] overflow-hidden select-none touch-none"
      >
        {inputMode === "hand" && hasVideo && (
          <video
            ref={cameraVideoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            playsInline
            muted
            aria-hidden="true"
          />
        )}
        <GameCanvas gameCanvasRef={gameCanvasRef} fxCanvasRef={fxCanvasRef} />

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)" }}
        />

        {/* Top chrome bar */}
        <div
          className="absolute top-0 inset-x-0 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(8,8,14,0.7) 0%, transparent 100%)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 pointer-events-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => (window.location.href = "/")}
                className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#48485a] hover:text-[#e8e8f0] transition-colors duration-200 cursor-pointer px-3 py-2 rounded-sm hover:bg-white/5"
                aria-label="Exit to main menu"
              >
                ← EXIT
              </button>
              <button
                onClick={toggleMute}
                className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#48485a] hover:text-[#e8e8f0] transition-colors duration-200 cursor-pointer px-3 py-2 rounded-sm hover:bg-white/5"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#48485a] hover:text-[#e8e8f0] transition-colors duration-200 cursor-pointer px-3 py-2 rounded-sm hover:bg-white/5 hidden sm:block"
                aria-label="Toggle Fullscreen"
              >
                ⛶
              </button>
            </div>

            {/* Center wordmark */}
            <span
              className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.35em] uppercase text-[#ffffff14] pointer-events-none"
              aria-hidden="true"
            >
              HANDSHOOTER
            </span>

            {/* Input mode indicator */}
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#00f5d4", boxShadow: "0 0 6px #00f5d4" }}
              />
              <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#48485a]">
                {inputMode === "hand" ? "Hand" : "Mouse"}
              </span>
            </div>
          </div>
        </div>

        <HUD engineStateRef={stateRef} />

        {tutorial.enabled && (
          <TutorialPrompt
            tutorialState={tutorial.tutorialState}
            reducedMotion={reducedMotion}
            highContrastUi={highContrastUi}
          />
        )}

        <GameOverOverlay engineStateRef={stateRef} onRestart={handleRestart} />
        <WaveAnnouncement engineStateRef={stateRef} playing={screenState === "playing"} />
      </div>
    );
  }

  if (screenState === "requesting") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#08080e] select-none">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-6 rounded-full border-2 border-[#6c5ce7] border-t-transparent animate-spin" />
          <p
            className="text-lg font-bold text-[#e8e8f0] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Requesting Camera
          </p>
          <p className="text-sm font-mono text-[#6c6c80]">
            Please grant camera access when prompted
          </p>
        </div>
      </div>
    );
  }

  if (screenState === "camera-error") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#08080e] select-none">
        <div className="relative w-full max-w-lg mx-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full border border-[#ff4060]/30">
            <svg
              className="w-8 h-8 text-[#ff4060]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-[#e8e8f0] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Camera Unavailable
          </h1>

          <p className="text-sm font-mono text-[#6c6c80] leading-relaxed max-w-sm mx-auto mb-8">
            {cameraError || "Could not access the camera. You can still play using mouse controls."}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleFallbackToMouse}
              className="group relative w-full py-4 rounded-sm font-display text-sm font-bold tracking-[0.25em] uppercase text-[#08080e] transition-all duration-300 cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7] rounded-sm transition-opacity duration-300 group-hover:opacity-90" />
              <span className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-xl" />
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#00f5d4]/50 group-hover:ring-[#6c5ce7]/70" />
              <span className="relative z-10">Use Mouse Instead</span>
            </button>

            <button
              onClick={handleRetryCamera}
              className="group relative w-full py-4 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
            >
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300" />
              <span className="relative z-10">Retry Camera</span>
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="group relative w-full py-4 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#48485a] transition-all duration-300 cursor-pointer hover:text-[#6c6c80]"
            >
              <span className="relative z-10">Back to Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screenState === "explaining") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#08080e] select-none">
        <div className="relative w-full max-w-lg mx-6">
          <div className="absolute -inset-8 bg-gradient-to-r from-[#6c5ce7]/10 via-[#00f5d4]/5 to-[#8833ff]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full border border-[#00f5d4]/30">
              <svg
                className="w-8 h-8 text-[#00f5d4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-[#e8e8f0] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It Works
            </h1>

            <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
              <Step number={1} text="Grant camera access when prompted" />
              <Step number={2} text="Point your index finger to aim the weapon" />
              <Step number={3} text="Weapon auto-fires continuously at your target" />
              <Step number={4} text="Survive endless monster waves and upgrade your weapon" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleBack}
                className="group relative w-full py-4 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
              >
                <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300" />
                <span className="relative z-10">Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionPrompt
      onGrantCamera={handleGrantCamera}
      onUseMouse={handleUseMouse}
    />
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6c5ce7]/20 border border-[#6c5ce7]/30 flex items-center justify-center text-[10px] font-mono text-[#6c5ce7] font-bold">
        {number}
      </span>
      <p className="text-sm font-mono text-[#6c6c80] leading-relaxed pt-0.5">
        {text}
      </p>
    </div>
  );
}
