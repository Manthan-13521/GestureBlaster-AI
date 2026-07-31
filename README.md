<div align="center">

<img src="https://img.shields.io/badge/Gesture_Blaster-v1.0-EF4444?style=for-the-badge&labelColor=09090B&logo=mediapipe&logoColor=FF6D00" alt="Gesture Blaster" height="32"/>

<h1>
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/crosshair.svg" width="28" style="vertical-align:middle;" />
  &nbsp;GestureBlaster
</h1>

<p><strong>AI Hand-Gesture Shooter — Your Hands Are the Weapon</strong></p>

<p>
  <a href="#-demo">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-monster--4050.vercel.app-EF4444?style=for-the-badge&labelColor=09090B" alt="Live Demo"/>
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-16.2-ffffff?style=for-the-badge&logo=next.js&logoColor=white&labelColor=000000" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=20232A" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1a1a2e" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/MediaPipe-Tasks_Vision-FF6D00?style=for-the-badge&labelColor=09090B" alt="MediaPipe Tasks Vision"/>
  <img src="https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white&labelColor=1a1a2e" alt="Vitest"/>
</p>

<p>
  <img src="https://img.shields.io/github/last-commit/Manthan-13521/GestureBlaster-AI?style=flat-square&color=EF4444&labelColor=09090B&label=Last+Commit" alt="Last Commit"/>
  <img src="https://img.shields.io/github/repo-size/Manthan-13521/GestureBlaster-AI?style=flat-square&color=FF6D00&labelColor=09090B&label=Repo+Size" alt="Repo Size"/>
  <img src="https://img.shields.io/badge/Input-Hands%20%E2%80%A2%20Mouse%20%E2%80%A2%20Touch-22d3ee?style=flat-square&labelColor=09090B" alt="Input Methods"/>
  <img src="https://img.shields.io/badge/License-All_Rights_Reserved-red?style=flat-square&labelColor=09090B" alt="License"/>
</p>

<br/>

<p>
  <a href="#-features">Features</a> ·
  <a href="#-how-it-works">How It Works</a> ·
  <a href="#-gesture-controls">Gesture Controls</a> ·
  <a href="#-gameplay">Gameplay</a> ·
  <a href="#-system-architecture">Architecture</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a>
</p>

</div>

---

**GestureBlaster** is an AI-powered web shooter where **your hands are the weapon**. Using real-time hand tracking from MediaPipe Tasks Vision, the game maps your palm and fingers directly to aim and fire — no controller, no keyboard, just you and the monsters.

Built as a modern, fully client-side experience: the camera feed never leaves your device, the engine runs at 60 FPS in the browser, and the same architecture supports mouse and touch fallbacks so the game is playable anywhere.

---

## ✨ Features

### 🖐️ Pure Hand-Gesture Combat (Flagship)
- **Aim with your hand** — palm position maps to an on-screen reticle with smooth landmark interpolation
- **Shoot by gesture** — natural pulling/firing hand motion triggers projectiles (slingshot-style pull physics)
- **Landmark smoothing** — damped coordinate filtering keeps the reticle stable without feeling laggy
- **One-time calibration** — a dedicated calibration screen with live hand wireframe aligns your play area perfectly

### 👾 Wave-Based Monster Combat
- **Wave manager** — escalating waves of enemies with increasing intensity and spawn patterns
- **Monster variety** — distinct enemy types including ghostly wisps with unique movement behaviors
- **Collision engine** — deterministic hit detection between projectiles, monsters, and the player
- **Screen shake & particle systems** — impact feedback, projectile trails, and death explosions

### 🎮 Complete Game Experience
- **Tutorial machine** — step-by-step onboarding teaches aiming and firing before the first wave
- **HUD** — live score, wave progress, health, and ammo at a glance
- **Game over & settings** — polished overlays plus a full settings modal (sensitivity, audio, input)
- **Wave announcements** — cinematic interludes between combat rounds

### 🎧 Immersive Audio
- **Audio manager** — procedural sound engine for shots, hits, explosions, and wave cues (no audio assets required)

### 🔀 Multi-Input Architecture
- **Hand tracking** (MediaPipe) — primary, camera-based control
- **Mouse adapter** — desktop fallback with identical feel
- **Touch adapter** — mobile play support
- **Camera manager** — handles permission prompts and camera lifecycle gracefully

---

## 🕹️ How It Works

```
Webcam ──► MediaPipe Tasks Vision ──► Hand landmarks (21 points)
                    │
                    ▼
          Coordinate Mapper ──► normalized play-space position
                    │
                    ▼
        Landmark Smoother ──► jitter-free reticle
                    │
                    ▼
          Pull Physics ──► fire gesture detection
                    │
                    ▼
          Game Engine ──► projectiles, monsters, waves, score
```

1. **Grant camera access** — the game requests webcam permission and renders a live hand wireframe during calibration
2. **Calibrate your play space** — the system learns your comfortable range of motion
3. **Aim** — move your hand; the reticle follows with smoothed tracking
4. **Fire** — perform the pull gesture to release projectiles at the target
5. **Survive the waves** — dodge wisps and monsters while chaining hits to maximize score

All vision processing runs **fully in-browser** via MediaPipe Tasks Vision — no frames are uploaded to a server.

---

## 🎯 Gesture Controls

| Action | Hand Gesture | Fallback |
|--------|-------------|----------|
| **Aim** | Move your palm through the calibrated area | Mouse cursor / touch drag |
| **Fire** | Pull motion (slingshot release) | Mouse click / tap |
| **Restart** | Re-center and hold at game over | Button click |

> Sensitivity and smoothing are adjustable in the in-game settings modal to match your camera and hand speed.

---

## 🎮 Gameplay

- **Waves** — each wave introduces more enemies and faster movement; survive as long as you can
- **Enemies** — wisps and monsters with distinct behaviors challenge both aim speed and accuracy
- **Feedback** — screen shake, projectile trails, particles, and synthesized audio make every hit satisfying
- **Score** — accuracy matters: chain hits without missing for score multipliers

---

## 🏗️ System Architecture

The codebase is organized into clean, single-responsibility modules:

```
src/
├── app/                  # Next.js app shell (layout, page, global styles)
├── components/
│   ├── game/             # GameCanvas, HUD, overlays, settings, prompts
│   ├── screens/          # Landing screen & game screen flow
│   └── calibration/      # Calibration UI + live hand wireframe
├── engine/               # Core game systems
│   ├── game-engine.ts    # Main game loop & state machine
│   ├── wave-manager.ts   # Wave progression & spawning
│   ├── weapon-system.ts  # Firing, cooldown, projectile spawning
│   ├── monster.ts        # Enemy entities & behavior
│   ├── wisp.ts           # Secondary enemy type
│   ├── projectile.ts     # Projectile physics
│   ├── collision.ts      # Deterministic hit detection
│   └── tutorial-machine.ts # Guided onboarding flow
├── input/                # Input layer (the interesting part)
│   ├── hand-tracker.ts   # MediaPipe landmark extraction
│   ├── coordinate-mapper.ts # Camera space → play space mapping
│   ├── landmark-smoother.ts # Jitter reduction
│   ├── pull-physics.ts   # Fire-gesture detection
│   ├── camera-manager.ts # Webcam lifecycle & permissions
│   ├── mouse-adapter.ts  # Desktop fallback
│   └── touch-adapter.ts  # Mobile fallback
├── effects/              # renderers: particles, trails, screen shake, wisps
├── audio/                # procedural audio manager
├── hooks/                # useHandTracking, useGameEngine, useCalibration, ...
├── types/                # shared domain types (calibration, input, settings)
└── __tests__/            # Vitest unit tests
```

**Design principles:**
- **Engine/input decoupling** — swap hand tracking for mouse/touch without touching game logic
- **Pure TypeScript engine** — game systems are framework-agnostic and fully unit-testable
- **Client-side privacy** — all vision inference happens locally in the browser

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 · React 19 |
| Language | TypeScript (strict) |
| Vision AI | MediaPipe Tasks Vision |
| Rendering | HTML5 Canvas (custom engine) |
| Testing | Vitest |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A webcam
- (Optional) A modern browser with WebGL support

### Installation

```bash
# 1. Clone & install
git clone https://github.com/Manthan-13521/GestureBlaster-AI.git
cd GestureBlaster-AI
npm install

# 2. Run the dev server
npm run dev

# 3. Open the game
# http://localhost:3000
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint checks |
| `npm test` | Run Vitest unit tests |

---

## 🔭 Roadmap

- [ ] Score multiplier & combo system
- [ ] Boss waves with multi-phase enemies
- [ ] Persistent high scores (local + online leaderboard)
- [ ] More gesture actions (dodge, special weapon, pause)
- [ ] Sound effects presets & music toggle
- [ ] PWA install support

---

## 📄 License

All rights reserved. This project is a demonstration of AI-driven gesture interfaces and is not licensed for commercial reuse without permission.

---

<div align="center">

**© 2026 Manthan Jaiswal** — Built with Next.js, TypeScript & MediaPipe.

<br/>

<a href="https://monster-4050.vercel.app">🚀 Play GestureBlaster</a>

</div>
