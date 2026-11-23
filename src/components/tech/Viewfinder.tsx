"use client";

import { useEffect, useRef } from "react";

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");

const corner = "absolute h-2.5 w-2.5 border-white/35";

/** Viewport crop marks + live cursor coordinates + grid hint. Desktop only. */
export function Viewfinder({ grid }: { grid: boolean }) {
  const coordsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      raf = 0;
      if (coordsRef.current) coordsRef.current.textContent = `X ${pad(x)} · Y ${pad(y)}`;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[56] font-mono text-[10px] uppercase leading-none tracking-[0.14em] text-white mix-blend-difference"
    >
      <span className={`${corner} left-3 top-3 border-l border-t`} />
      <span className={`${corner} right-3 top-3 border-r border-t`} />
      <span className={`${corner} bottom-3 left-3 border-b border-l`} />
      <span className={`${corner} bottom-3 right-3 border-b border-r`} />

      <span ref={coordsRef} className="absolute bottom-8 left-[13px] rotate-180 whitespace-nowrap tabular-nums text-white/45 [writing-mode:vertical-rl]">
        X 0000 · Y 0000
      </span>
      <span className="absolute bottom-8 right-[13px] rotate-180 whitespace-nowrap text-white/45 [writing-mode:vertical-rl]">
        {grid ? (
          <>
            Grid <span className="text-white/90">on</span> · 12 col
          </>
        ) : (
          <>
            Press <span className="text-white/90">G</span> · grid
          </>
        )}
      </span>
    </div>
  );
}

/** Faint 12-column layout grid (4 on small screens). Toggled with "G". */
export function GridOverlay({ on }: { on: boolean }) {
  return (
    <div
      aria-hidden
      className={`gutter pointer-events-none fixed inset-0 z-[54] grid grid-cols-4 gap-[clamp(12px,1.6vw,24px)] transition-opacity duration-500 md:grid-cols-12 ${
        on ? "opacity-100" : "opacity-0"
      }`}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className={`h-full border-x border-accent/15 bg-accent/[0.035] ${i >= 4 ? "hidden md:block" : ""}`}
        />
      ))}
    </div>
  );
}
