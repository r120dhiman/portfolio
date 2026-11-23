"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Full-bleed WebGL noise field (ogl, lazy-loaded). The CSS gradient underneath
 * is the fallback when WebGL is unavailable and the first paint before the
 * canvas fades in. Reacts to the pointer and to its own scroll position.
 */
export function ShaderField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const el: HTMLDivElement = node;
    let destroyed = false;
    let instance: { destroy: () => void; canvas: HTMLCanvasElement } | null = null;

    // Defer past first paint / hydration so it never competes with LCP.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(() => boot(), { timeout: 600 }) : globalThis.setTimeout(() => boot(), 120);

    async function boot() {
      try {
        const { createFluid } = await import("./webgl/fluid");
        if (destroyed) return;
        instance = createFluid(el, {
          still: prefersReducedMotion(),
          autoDrift: window.matchMedia("(hover: none)").matches,
        });
        el.dataset.webgl = "on";
      } catch {
        // No WebGL: the CSS gradient stays.
        el.dataset.webgl = "off";
      }
    }

    return () => {
      destroyed = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else globalThis.clearTimeout(idle);
      instance?.destroy();
      instance = null;
      delete el.dataset.webgl;
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={clsx("pointer-events-none overflow-hidden bg-bg", className)}
      style={{
        backgroundImage:
          "radial-gradient(60% 55% at 72% 38%, rgba(255,90,31,0.16), transparent 70%), radial-gradient(80% 60% at 20% 110%, rgba(255,90,31,0.10), transparent 70%), radial-gradient(120% 90% at 50% 50%, #161210 0%, #0b0b0a 70%)",
      }}
    />
  );
}
