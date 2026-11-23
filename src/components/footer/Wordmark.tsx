"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const GLYPHS = "01#%▓░/\\<>*+=$&";
const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * Giant fit-to-width wordmark. Each letter keeps its real glyph in layout (so widths never jump)
 * and an overlay cycles through machine glyphs before resolving. Scrambles on scroll-in;
 * each letter glitches again on hover.
 */
export function Wordmark({ text, className }: { text: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);

  // Fit the wordmark to the container width.
  useEffect(() => {
    const wrap = wrapRef.current;
    const mark = markRef.current;
    if (!wrap || !mark) return;
    const fit = () => {
      mark.style.fontSize = "100px";
      const w = mark.scrollWidth;
      const cs = getComputedStyle(wrap);
      const inner = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      // 0.98 safety margin: glyph outlines (the final "R") overhang their advance width under negative tracking.
      if (w > 0) mark.style.fontSize = `${Math.floor(((100 * inner) / w) * 0.98 * 100) / 100}px`;
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const mark = markRef.current;
      if (!mark || prefersReducedMotion()) return;
      const letters = Array.from(mark.querySelectorAll<HTMLElement>("[data-letter]"));

      /** Scramble one letter for `dur` seconds, then resolve. */
      const scramble = (el: HTMLElement, dur: number, delay = 0) => {
        const real = el.querySelector<HTMLElement>("[data-real]")!;
        const ghost = el.querySelector<HTMLElement>("[data-ghost]")!;
        gsap.killTweensOf(ghost);
        let lastSwap = 0;
        return gsap.to(ghost, {
          duration: dur,
          delay,
          ease: "none",
          onStart: () => {
            real.style.opacity = "0";
            ghost.textContent = pick();
          },
          onUpdate() {
            const t = this.time();
            if (t - lastSwap > 0.05) {
              lastSwap = t;
              ghost.textContent = pick();
              ghost.style.color = Math.random() > 0.7 ? "var(--accent)" : "";
            }
          },
          onComplete: () => {
            ghost.textContent = "";
            ghost.style.color = "";
            real.style.opacity = "";
          },
          onInterrupt: () => {
            ghost.textContent = "";
            real.style.opacity = "";
          },
        });
      };

      gsap.set(letters, { yPercent: 100 });
      const play = () => {
        gsap.fromTo(
          letters,
          { yPercent: 100 },
          { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: { each: 0.045, from: "random" }, overwrite: true }
        );
        letters.forEach((el) => scramble(el, 0.5 + Math.random() * 0.7, Math.random() * 0.25));
      };

      const st = ScrollTrigger.create({
        trigger: mark,
        start: "top bottom",
        toggleActions: "play none none none",
        onEnter: play,
      });

      // Per-letter hover glitch (fine pointers only).
      const cleanups: (() => void)[] = [];
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        letters.forEach((el) => {
          const enter = () => {
            if (gsap.isTweening(el)) return;
            scramble(el, 0.35);
            gsap.fromTo(
              el,
              { rotateX: 0, y: 0 },
              {
                keyframes: [
                  { y: "-0.06em", rotateX: -70, duration: 0.12, ease: "power2.in" },
                  { y: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" },
                ],
              }
            );
          };
          el.addEventListener("pointerenter", enter);
          cleanups.push(() => el.removeEventListener("pointerenter", enter));
        });
      }

      return () => {
        st.kill();
        cleanups.forEach((c) => c());
      };
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} className={className}>
      <p aria-hidden className="select-none overflow-hidden [perspective:800px]">
        <span
          ref={markRef}
          className="inline-block whitespace-nowrap pl-[0.02em] pr-[0.08em] pt-[0.06em] font-medium leading-[0.82] tracking-[-0.055em]"
          style={{ fontSize: "14.5vw" }}
        >
          {text.split("").map((ch, i) =>
            ch === " " ? (
              <span key={i} className="inline-block">
                {" "}
              </span>
            ) : (
              <span
                key={i}
                data-letter
                className="relative inline-block origin-bottom transition-colors duration-300 will-change-transform hover:text-accent"
              >
                <span data-real>{ch}</span>
                <span
                  data-ghost
                  className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono font-normal tracking-normal"
                />
              </span>
            )
          )}
        </span>
      </p>
    </div>
  );
}
