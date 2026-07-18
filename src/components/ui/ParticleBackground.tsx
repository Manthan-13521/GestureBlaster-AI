"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const COLORS = [
      "rgba(108, 92, 231, ALPHA)",
      "rgba(0, 245, 212, ALPHA)",
      "rgba(136, 51, 255, ALPHA)",
      "rgba(255, 64, 96, ALPHA)",
    ];

    const spawnParticle = () => {
      if (particles.length > 120) return;
      const maxLife = 200 + Math.random() * 300;
      const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.2 + Math.random() * 0.4),
        size: 1 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
        life: 0,
        maxLife,
        color: colorBase,
      });
    };

    const drawRift = () => {
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.4;
      const time = Date.now() * 0.001;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 + Math.sin(time * 0.5) * 20);
      gradient.addColorStop(0, "rgba(136, 51, 255, 0.03)");
      gradient.addColorStop(0.4, "rgba(108, 92, 231, 0.02)");
      gradient.addColorStop(1, "rgba(136, 51, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 3; i++) {
        const angle = time * 0.3 + (i * Math.PI * 2) / 3;
        const dist = 40 + Math.sin(time + i) * 20;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist * 0.3;

        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(136, 51, 255, ${0.1 + Math.sin(time + i) * 0.05})`;
        ctx.fill();
      }
    };

    let spawnCounter = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawRift();

      spawnCounter++;
      if (spawnCounter % 3 === 0) {
        spawnParticle();
      }

      ctx.save();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.999;

        const lifeRatio = p.life / p.maxLife;
        const fadeIn = Math.min(p.life / 60, 1);
        const fadeOut = Math.max(1 - lifeRatio, 0);
        const currentAlpha = p.alpha * fadeIn * fadeOut;

        if (lifeRatio > 0.95 || currentAlpha < 0.01) {
          particles.splice(i, 1);
          continue;
        }

        const colorStr = p.color.replace("ALPHA", currentAlpha.toFixed(3));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.5 + fadeIn * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = colorStr;
        ctx.fill();

        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace("ALPHA", (currentAlpha * 0.15).toFixed(3));
          ctx.fill();
        }
      }

      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      particles = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
