"use client";

import { useEffect, useRef, useState } from "react";
import { caseSections } from "@/content/case-studies";
import { scramble } from "./scramble";
import { isRendered, useRescan } from "./useRescan";
import { prefersReducedMotion } from "@/lib/gsap";

const LABELS: Record<string, string> = {
  top: "Intro",
  work: "Work",
  lab: "Lab",
  experience: "Experience",
  projects: "Projects",
  skills: "Toolkit",
  contact: "Contact",
  ...Object.fromEntries(caseSections.map((s) => [s.id, s.label])),
};

const routeLabel = (pathname: string) => {
  if (pathname === "/") return "Index";
  const seg = pathname.split("/").filter(Boolean).pop() ?? "";
  return seg.replace(/[-_]/g, " ");
};

type Sec = { id: string; label: string; el: HTMLElement; at: number };

/** Where the active section flips: this fraction of the viewport from the top. */
const LINE = 0.45;

/**
 * Right-edge scroll rail: section index + name (scrambles on change), progress
 * fill, tick marks at each section, and a % readout. Desktop only (mounted by TechLayer).
 */
export function ScrollHud({ pathname }: { pathname: string }) {
  const [ticks, setTicks] = useState<{ id: string; at: number }[]>([]);
  const [active, setActive] = useState<{ index: number; label: string }>({ index: -1, label: routeLabel(pathname) });
  const secsRef = useRef<Sec[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  });

  const update = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const y = window.scrollY;
    const p = Math.min(1, Math.max(0, y / max));
    rootRef.current?.style.setProperty("--p", p.toFixed(4));
    accentRef.current?.style.setProperty("--p", p.toFixed(4));
    if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0") + "%";

    const line = window.innerHeight * LINE;
    let idx = -1;
    secsRef.current.forEach((s, i) => {
      if (s.el.getBoundingClientRect().top <= line) idx = i;
    });
    const label = idx >= 0 ? secsRef.current[idx].label : routeLabel(pathRef.current);
    setActive((prev) => (prev.index === idx && prev.label === label ? prev : { index: idx, label }));
  };
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  });

  useRescan(pathname, () => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("main section[id]")).filter(isRendered);
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const secs = els.map((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      return {
        id: el.id,
        label: LABELS[el.id] ?? el.id.replace(/[-_]/g, " "),
        el,
        at: Math.min(1, Math.max(0, (top - window.innerHeight * LINE) / max)),
      };
    });
    secsRef.current = secs;
    setTicks((prev) => {
      const next = secs.map(({ id, at }) => ({ id, at: Math.round(at * 1000) / 1000 }));
      const same = prev.length === next.length && prev.every((t, i) => t.id === next[i].id && t.at === next[i].at);
      return same ? prev : next;
    });
    updateRef.current();
  });

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updateRef.current());
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Decode the label whenever the section changes.
  useEffect(() => {
    if (!labelRef.current || prefersReducedMotion()) return;
    return scramble(labelRef.current, { duration: 0.55 });
  }, [active]);

  const index = active.index >= 0 ? String(active.index + 1).padStart(2, "0") : "00";
  const total = String(ticks.length).padStart(2, "0");

  return (
    <>
      <div
        ref={rootRef}
        aria-hidden
        className="tech-hud pointer-events-none fixed inset-y-0 right-0 z-[56] w-12 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-white mix-blend-difference"
      >
        {/* Section readout, reads bottom → top above the rail */}
        <span
          ref={labelRef}
          className="absolute bottom-[calc(63vh+14px)] left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap text-white/70 [writing-mode:vertical-rl]"
        >
          {index} / {active.label}
        </span>

        {/* Rail */}
        <div className="absolute left-1/2 top-[37vh] h-[26vh] w-px -translate-x-1/2 bg-white/15">
          <div className="absolute inset-0 origin-top bg-white/60" style={{ transform: "scaleY(var(--p, 0))" }} />
          {ticks.map((t, i) => (
            <span
              key={t.id}
              className={`absolute left-1/2 h-px -translate-x-1/2 transition-[width,background-color] duration-500 ${
                i === active.index ? "w-3 bg-white" : "w-1.5 bg-white/40"
              }`}
              style={{ top: `${t.at * 100}%` }}
            />
          ))}
          <span className="absolute -top-px left-1/2 h-px w-2.5 -translate-x-1/2 bg-white/40" />
          <span className="absolute -bottom-px left-1/2 h-px w-2.5 -translate-x-1/2 bg-white/40" />
        </div>

        {/* Readouts below the rail */}
        <div className="absolute left-1/2 top-[calc(63vh+14px)] flex -translate-x-1/2 flex-col items-center gap-2 text-white/50">
          <span ref={pctRef} className="tabular-nums tracking-[0.04em]">
            000%
          </span>
          <span className="tabular-nums tracking-[0.04em]">{total}</span>
        </div>
      </div>

      {/* Accent playhead — separate layer so it keeps its true colour (no blend) */}
      <div ref={accentRef} aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-[56] w-12">
        <span
          className="absolute left-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ top: "calc(37vh + var(--p, 0) * 26vh)" }}
        />
      </div>
    </>
  );
}
