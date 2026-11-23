"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Custom cursor: a dot + lagging ring (mix-blend-mode: difference) and an
 * accent "label bubble".
 *
 * data-cursor API (put these on any element):
 *   - Any `a`, `button`, `[role="button"]`, `label`, `summary` or `[data-cursor]`
 *     grows the ring (hover state).
 *   - `data-cursor="view"`          → big accent circle reading "View".
 *   - `data-cursor-label="Open"`    → big accent circle with custom text
 *                                    (takes precedence over "view").
 *   - `data-cursor="hide"`          → hide the custom cursor over the element.
 *   - `data-cursor="text"`          → native cursor (also automatic for inputs,
 *                                    textareas, selects and contenteditable).
 * Disabled entirely on touch / coarse pointers.
 */

const INTERACTIVE = "a, button, [role='button'], label, summary, [data-cursor], [data-cursor-label]";
const TEXT_FIELD =
  "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']):not([type='range']), textarea, select, [contenteditable=''], [contenteditable='true'], [data-cursor='text']";

export function Cursor() {
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const bubbleWrap = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const w = wrap.current!;
    const bw = bubbleWrap.current!;
    const layers = [w, bw];
    const d = dot.current!;
    const r = ring.current!;
    const b = bubble.current!;
    const lbl = label.current!;
    const html = document.documentElement;

    html.classList.add("has-cursor");
    w.style.display = bw.style.display = "block";
    gsap.set([d, r, b], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    gsap.set(b, { scale: 0 });

    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3.out" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3.out" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3.out" });
    const bx = gsap.quickTo(b, "x", { duration: 0.55, ease: "power3.out" });
    const by = gsap.quickTo(b, "y", { duration: 0.55, ease: "power3.out" });

    let shown = false;
    let mode: "idle" | "hover" | "label" | "hidden" | "text" = "idle";

    const setMode = (next: typeof mode, text?: string, force = false) => {
      if (next === mode && next !== "label" && !force) return;
      mode = next;
      const hide = next === "hidden" || next === "text";
      gsap.to(layers, { opacity: hide || !shown ? 0 : 1, duration: 0.2, overwrite: "auto" });
      gsap.to(d, { scale: next === "idle" ? 1 : 0, duration: 0.3, ease: "power3.out", overwrite: "auto" });
      gsap.to(r, {
        scale: next === "hover" ? 1.9 : next === "label" ? 0.4 : 1,
        opacity: next === "label" ? 0 : 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      if (next === "label" && text) lbl.textContent = text;
      gsap.to(b, { scale: next === "label" ? 1 : 0, duration: 0.5, ease: "expo.out", overwrite: "auto" });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      bx(e.clientX);
      by(e.clientY);
      if (!shown) {
        shown = true;
        gsap.set([d, r, b], { x: e.clientX, y: e.clientY });
        if (mode !== "hidden" && mode !== "text") gsap.to(layers, { opacity: 1, duration: 0.3 });
      }
    };

    const resolve = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      if (!el) return setMode("idle");
      if (el.closest(TEXT_FIELD)) return setMode("text");
      const hit = el.closest<HTMLElement>(INTERACTIVE);
      if (!hit) return setMode("idle");
      const kind = hit.dataset.cursor;
      const custom = hit.dataset.cursorLabel;
      if (kind === "hide") return setMode("hidden");
      if (custom) return setMode("label", custom);
      if (kind === "view") return setMode("label", "View");
      return setMode("hover");
    };

    const onOver = (e: PointerEvent) => resolve(e.target);
    const onLeaveDoc = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        shown = false;
        gsap.to(layers, { opacity: 0, duration: 0.2 });
      }
    };
    const onDown = () => gsap.to([r, b], { scale: "*=0.85", duration: 0.15, overwrite: false });
    const onUp = () => setMode(mode, lbl.textContent ?? undefined, true);
    // Elements can move under a still pointer (scroll); re-resolve on scroll end.
    let scrollTimer = 0;
    let lastX = -1;
    let lastY = -1;
    const track = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onScroll = () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        if (lastX >= 0) resolve(document.elementFromPoint(lastX, lastY));
      }, 80);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointermove", track, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onLeaveDoc, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", track);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeaveDoc);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollTimer);
      gsap.killTweensOf([...layers, d, r, b]);
      html.classList.remove("has-cursor");
      w.style.display = bw.style.display = "none";
    };
  }, []);

  return (
    <>
      <style>{`
        html.has-cursor, html.has-cursor * { cursor: none !important; }
        html.has-cursor :is(input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-cursor="text"]) { cursor: auto !important; }
        html.has-cursor :is(input, textarea, [contenteditable=""], [contenteditable="true"], [data-cursor="text"]) { cursor: text !important; }
      `}</style>
      {/* Blend layer: dot + ring invert whatever is beneath them. */}
      <div
        ref={wrap}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[110] opacity-0 mix-blend-difference"
        style={{ display: "none" }}
      >
        <div
          ref={ring}
          className="absolute top-0 left-0 size-9 rounded-full border border-white will-change-transform"
        />
        <div ref={dot} className="absolute top-0 left-0 size-1.5 rounded-full bg-white will-change-transform" />
      </div>
      {/* Label layer: solid accent bubble (no blending). */}
      <div
        ref={bubbleWrap}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[111] opacity-0"
        style={{ display: "none" }}
      >
        <div
          ref={bubble}
          className="absolute top-0 left-0 grid size-24 place-items-center rounded-full bg-accent text-[#0b0b0a] will-change-transform"
        >
          <span ref={label} className="px-2 text-center font-mono text-[11px] leading-tight tracking-[0.08em] uppercase">
            View
          </span>
        </div>
      </div>
    </>
  );
}
