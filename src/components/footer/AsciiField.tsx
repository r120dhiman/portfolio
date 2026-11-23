"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const RAMP = " .·:-=+*%#▓";
const CELL_W = 11;
const CELL_H = 16;
const FPS = 30;

/**
 * Lightweight canvas ASCII field. A drifting interference pattern rendered as
 * glyphs; the pointer (tracked on `trackRef`) heats up a radius around it in accent.
 * Pauses when offscreen or the tab is hidden. Static single frame under reduced motion.
 */
export function AsciiField({
  trackRef,
  className,
}: {
  trackRef: React.RefObject<HTMLElement | null>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = prefersReducedMotion();
    const styles = getComputedStyle(document.documentElement);
    const muted = styles.getPropertyValue("--muted").trim() || "#8d8b84";
    const accent = styles.getPropertyValue("--accent").trim() || "#ff5a1f";
    const fontFamily = styles.getPropertyValue("--font-geist-mono").trim() || "monospace";

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let last = 0;
    let visible = false;
    // Pointer in canvas space, eased.
    const p = { x: -9999, y: -9999, tx: -9999, ty: -9999, heat: 0, theat: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `12px ${fontFamily}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      cols = Math.ceil(w / CELL_W);
      rows = Math.ceil(h / CELL_H);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      p.x += (p.tx - p.x) * 0.18;
      p.y += (p.ty - p.y) * 0.18;
      p.heat += (p.theat - p.heat) * 0.08;
      const time = t * 0.00035;
      const radius = 150;
      const hot: [string, number, number][] = [];
      ctx.fillStyle = muted;
      for (let j = 0; j < rows; j++) {
        const y = j * CELL_H + CELL_H / 2;
        // Fade toward the top so the field melts into the footer.
        const fade = Math.min(1, (j / rows) * 1.6);
        for (let i = 0; i < cols; i++) {
          const x = i * CELL_W + CELL_W / 2;
          let v =
            Math.sin(i * 0.11 + time * 2.1) * Math.cos(j * 0.17 - time * 1.3) +
            Math.sin((i + j) * 0.06 + time) * 0.6;
          v = (v + 1.6) / 3.2; // ~0..1
          v = v * v * fade * 0.75;
          const dx = x - p.x;
          const dy = y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          let boost = 0;
          if (d < radius) boost = (1 - d / radius) ** 2 * p.heat;
          const val = Math.min(0.999, v + boost);
          const ch = RAMP[Math.floor(val * RAMP.length)];
          if (ch === " ") continue;
          if (boost > 0.25) hot.push([ch, x, y]);
          else ctx.fillText(ch, x, y);
        }
      }
      if (hot.length) {
        ctx.fillStyle = accent;
        for (const [ch, x, y] of hot) ctx.fillText(ch, x, y);
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 1000 / FPS) return;
      last = t;
      draw(t);
    };

    const start = () => {
      if (raf || reduce || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    draw(0);

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      p.tx = e.clientX - r.left;
      p.ty = e.clientY - r.top;
      if (p.x < -1000) {
        p.x = p.tx;
        p.y = p.ty;
      }
      p.theat = 0.9;
    };
    const onLeave = () => (p.theat = 0);
    if (fine && !reduce) {
      track.addEventListener("pointermove", onMove);
      track.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerleave", onLeave);
    };
  }, [trackRef]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
