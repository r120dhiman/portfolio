"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { scramble } from "./scramble";
import { isRendered, useRescan } from "./useRescan";

/**
 * Two route-aware scanners, both without touching React-owned DOM structure:
 *  1. A thin accent scanline sweeps down each section <h2> as it enters view.
 *     The beam lives in a fixed overlay and follows the heading's rect each frame.
 *  2. Mono `.t-label` eyebrows inside sections decode through glyphs on enter.
 */
/** React tags a DOM node with `__reactFiber$…` once it has rendered/hydrated it. */
const isHydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"));

export function HeadingScan({ pathname }: { pathname: string }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const tracked = useRef(new Map<HTMLElement, ScrollTrigger>());
  const swept = useRef(new WeakSet<HTMLElement>());
  const labelIO = useRef<IntersectionObserver | null>(null);
  const labelsSeen = useRef(new WeakSet<HTMLElement>());

  const sweep = (h: HTMLElement) => {
    const layer = layerRef.current;
    if (!layer || swept.current.has(h) || prefersReducedMotion()) return;
    swept.current.add(h);
    const r0 = h.getBoundingClientRect();
    if (r0.bottom < 0 || r0.top > window.innerHeight) return;

    const box = document.createElement("div");
    box.className = "tech-scan";
    const beam = document.createElement("div");
    beam.className = "tech-scan__beam";
    box.appendChild(beam);
    layer.appendChild(box);

    const state = { p: 0, o: 1 };
    const place = () => {
      const r = h.getBoundingClientRect();
      const w = Math.min(r.width, window.innerWidth - r.left);
      box.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
      box.style.width = `${w}px`;
      box.style.height = `${r.height}px`;
      box.style.opacity = String(state.o);
      beam.style.transform = `translate3d(0, ${state.p * r.height}px, 0)`;
    };
    place();
    gsap
      .timeline({ delay: 0.15, onUpdate: place, onComplete: () => box.remove() })
      .to(state, { p: 1, duration: 1.1, ease: "power2.inOut" })
      .to(state, { o: 0, duration: 0.35, ease: "power1.out" }, "-=0.3");
  };
  const sweepRef = useRef(sweep);
  useEffect(() => {
    sweepRef.current = sweep;
  });

  useRescan(pathname, () => {
    if (prefersReducedMotion()) return;

    // Headings
    const headings = Array.from(document.querySelectorAll<HTMLElement>("main section h2")).filter(
      (h) => isRendered(h) && !h.classList.contains("sr-only") && h.offsetHeight > 8
    );
    const keep = new Set(headings);
    for (const [h, st] of tracked.current) {
      if (!keep.has(h)) {
        st.kill();
        tracked.current.delete(h);
      }
    }
    let created = false;
    for (const h of headings) {
      if (tracked.current.has(h) || swept.current.has(h)) continue;
      tracked.current.set(
        h,
        ScrollTrigger.create({
          trigger: h,
          start: "top 82%",
          end: "bottom top",
          // Measure after pinned sections (e.g. the work wheel) have added their spacing.
          refreshPriority: -10,
          onEnter: () => sweepRef.current(h),
        })
      );
      created = true;
    }
    if (created) ScrollTrigger.sort();

    // Eyebrow labels (SectionLabel handles its own via data-scramble)
    if (!labelIO.current) {
      labelIO.current = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target;
            labelIO.current?.unobserve(el);
            // Streamed/Suspense DOM can be visible before React hydrates it; touching its
            // text then causes a hydration mismatch. Retry until React has claimed the node.
            if (!isHydrated(el)) {
              window.setTimeout(() => el.isConnected && labelIO.current?.observe(el), 300);
              continue;
            }
            scramble(el);
          }
        },
        { rootMargin: "0px 0px -6% 0px" }
      );
    }
    document.querySelectorAll<HTMLElement>("main section p.t-label").forEach((el) => {
      if (labelsSeen.current.has(el) || el.closest("[data-scramble], a, button") || !isRendered(el)) return;
      if ((el.textContent ?? "").length > 48) return;
      labelsSeen.current.add(el);
      labelIO.current?.observe(el);
    });
  });

  useEffect(() => {
    const map = tracked.current;
    return () => {
      map.forEach((st) => st.kill());
      map.clear();
      labelIO.current?.disconnect();
      labelIO.current = null;
    };
  }, []);

  return <div ref={layerRef} aria-hidden className="pointer-events-none fixed inset-0 z-[45] overflow-hidden" />;
}
