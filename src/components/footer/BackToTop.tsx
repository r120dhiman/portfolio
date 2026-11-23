"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "@/components/fx/SmoothScroll";
import { Magnetic } from "@/components/fx/Magnetic";

const R = 46;
const C = 2 * Math.PI * R;

/** Magnetic back-to-top button with a circular scroll-progress ring and % readout. */
export function BackToTop() {
  const lenis = useLenis();
  const ringRef = useRef<SVGCircleElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      ringRef.current?.setAttribute("stroke-dashoffset", String(C * (1 - p)));
      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <Magnetic strength={0.4}>
      <button
        type="button"
        onClick={toTop}
        data-cursor-label="Top"
        aria-label="Back to top"
        className="group relative grid h-24 w-24 place-items-center rounded-full text-fg outline-none md:h-28 md:w-28"
      >
        <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="1" />
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeDasharray={C}
            strokeDashoffset={C}
            strokeLinecap="round"
          />
        </svg>
        <span
          aria-hidden
          className="absolute inset-[7%] rounded-full bg-accent opacity-0 transition-[opacity,transform] duration-500 [transition-timing-function:var(--ease-out)] scale-50 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        />
        <span aria-hidden className="relative block h-5 overflow-hidden font-mono text-xs leading-5 tracking-[0.06em] group-hover:text-bg group-focus-visible:text-bg">
          <span className="block transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">
            <span ref={pctRef}>00</span>%
          </span>
          <span className="absolute inset-x-0 top-full block text-center text-base transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">
            ↑
          </span>
        </span>
      </button>
    </Magnetic>
  );
}
