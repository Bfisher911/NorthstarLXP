"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/hooks";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "star";
  rotation: number;
  vr: number;
  life: number;
}

const COLORS = [
  "#3d66ff", // northstar
  "#34d399", // emerald
  "#f6c768", // gold
  "#a78bfa", // nova
  "#f472b6", // pink
  "#38bdf8", // sky
];

/**
 * Constellation-themed confetti burst. Renders into a fixed full-screen canvas
 * when `fire` is true, animates for ~1.8s, then auto-dismisses. Respects
 * prefers-reduced-motion (renders nothing).
 */
export function Confetti({
  fire,
  originX = 0.5,
  originY = 0.4,
  particleCount = 80,
  onDone,
}: {
  fire: boolean;
  originX?: number;
  originY?: number;
  particleCount?: number;
  onDone?: () => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (!fire || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cx = w * originX;
    const cy = h * originY;
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 7;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: (["rect", "circle", "star"] as const)[Math.floor(Math.random() * 3)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
      };
    });

    let rafId: number;
    const start = performance.now();
    const duration = 1800;

    const draw = (now: number) => {
      const t = (now - start) / duration;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        // physics
        p.vy += 0.18; // gravity
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.life = Math.max(0, 1 - t);

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "star") {
          drawStar(ctx, p.size / 1.8);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
        }
        ctx.restore();
      }
      if (t < 1) {
        rafId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, w, h);
        onDone?.();
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire, reduced]);

  if (reduced || !fire) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90]"
    />
  );
}

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a1) * r, Math.sin(a1) * r);
    else ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    ctx.lineTo(Math.cos(a2) * (r / 2.2), Math.sin(a2) * (r / 2.2));
  }
  ctx.closePath();
  ctx.fill();
}
