"use client";

import { useId, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { Diagram, DiagramNode } from "@/content/case-studies";

type Pt = { x: number; y: number };

const center = (n: DiagramNode): Pt => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

/** Point where the ray from the node's centre toward `to` leaves its rectangle (with a small gap). */
function borderPoint(n: DiagramNode, to: Pt, gap = 6): Pt {
  const c = center(n);
  const dx = to.x - c.x;
  const dy = to.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const hw = n.w / 2 + gap;
  const hh = n.h / 2 + gap;
  const t = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy));
  return { x: c.x + dx * t, y: c.y + dy * t };
}

function edgePath(a: DiagramNode, b: DiagramNode, curve = 0) {
  const ca = center(a);
  const cb = center(b);
  if (!curve) {
    const p1 = borderPoint(a, cb);
    const p2 = borderPoint(b, ca);
    return { d: `M${p1.x},${p1.y} L${p2.x},${p2.y}`, mid: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 } };
  }
  // Quadratic curve bowed perpendicular to the straight line.
  const mx = (ca.x + cb.x) / 2;
  const my = (ca.y + cb.y) / 2;
  const len = Math.hypot(cb.x - ca.x, cb.y - ca.y) || 1;
  const ctrl = { x: mx + (-(cb.y - ca.y) / len) * curve, y: my + ((cb.x - ca.x) / len) * curve };
  const p1 = borderPoint(a, ctrl);
  const p2 = borderPoint(b, ctrl);
  const mid = { x: 0.25 * p1.x + 0.5 * ctrl.x + 0.25 * p2.x, y: 0.25 * p1.y + 0.5 * ctrl.y + 0.25 * p2.y };
  return { d: `M${p1.x},${p1.y} Q${ctrl.x},${ctrl.y} ${p2.x},${p2.y}`, mid };
}

/** Hand-designed system diagram that draws itself in on scroll (stroke-dashoffset). */
export function ArchitectureDiagram({ diagram, title }: { diagram: Diagram; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(ref);
      const strokes = q("[data-draw]");
      const fills = q("[data-fade]");
      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(fills, { opacity: 0 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 75%", toggleActions: "play none none none" },
        defaults: { ease: "power2.inOut" },
      });
      tl.to(q("[data-draw='zone']"), { strokeDashoffset: 0, duration: 1.2, stagger: 0.15 })
        .to(q("[data-draw='node']"), { strokeDashoffset: 0, duration: 0.9, stagger: 0.06 }, "-=0.8")
        .to(fills, { opacity: 1, duration: 0.5, stagger: 0.03, ease: "power1.out" }, "-=0.6")
        .to(q("[data-draw='edge']"), { strokeDashoffset: 0, duration: 0.8, stagger: 0.08 }, "-=0.4");
      return () => {
        gsap.set(strokes, { clearProps: "strokeDasharray,strokeDashoffset" });
      };
    },
    { scope: ref }
  );

  return (
    <figure className="my-10">
      <div ref={ref} className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] md:mx-0 md:px-0" data-lenis-prevent>
        <svg
          viewBox="0 0 1000 600"
          role="img"
          aria-labelledby={`${uid}-t ${uid}-d`}
          className="h-auto w-full min-w-[720px] rounded-2xl border border-line bg-bg-2"
        >
          <title id={`${uid}-t`}>{`${title} architecture`}</title>
          <desc id={`${uid}-d`}>{diagram.caption}</desc>
          <defs>
            <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
            </marker>
            <marker id={`${uid}-aa`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
            </marker>
            <pattern id={`${uid}-g`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--line)" />
            </pattern>
          </defs>
          <rect width="1000" height="600" fill={`url(#${uid}-g)`} opacity="0.6" />

          {diagram.zones?.map((z) => (
            <g key={z.label}>
              <rect
                data-draw="zone"
                pathLength={1}
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                rx="14"
                fill="none"
                stroke="var(--line)"
                strokeWidth="1.5"
                strokeDasharray="1"
              />
              <text data-fade x={z.x + 14} y={z.y + 24} fill="var(--muted)" fontSize="12" fontFamily="var(--font-geist-mono)" letterSpacing="1.2">
                {z.label.toUpperCase()}
              </text>
            </g>
          ))}

          {diagram.edges.map((e) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const { d, mid } = edgePath(a, b, e.curve);
            const color = e.accent ? "var(--accent)" : "var(--muted)";
            const marker = `url(#${uid}-${e.accent ? "aa" : "a"})`;
            return (
              <g key={`${e.from}-${e.to}`}>
                <path
                  data-draw="edge"
                  pathLength={1}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={e.accent ? 2 : 1.4}
                  markerEnd={marker}
                  markerStart={e.both ? marker : undefined}
                />
                {e.label && (
                  <g data-fade>
                    <rect x={mid.x - e.label.length * 3.6 - 8} y={mid.y - 11} width={e.label.length * 7.2 + 16} height="22" rx="11" fill="var(--bg)" stroke="var(--line)" />
                    <text x={mid.x} y={mid.y + 4} textAnchor="middle" fill={e.accent ? "var(--accent)" : "var(--muted)"} fontSize="11.5" fontFamily="var(--font-geist-mono)">
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {diagram.nodes.map((n) => {
            const c = center(n);
            return (
              <g key={n.id}>
                <rect
                  data-fade
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx="10"
                  fill={n.accent ? "color-mix(in oklab, var(--accent) 12%, var(--bg))" : "var(--bg)"}
                />
                <rect
                  data-draw={n.external ? undefined : "node"}
                  data-fade={n.external ? true : undefined}
                  pathLength={n.external ? undefined : 1}
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx="10"
                  fill="none"
                  stroke={n.accent ? "var(--accent)" : "var(--muted)"}
                  strokeOpacity={n.accent ? 1 : 0.6}
                  strokeWidth={n.accent ? 1.8 : 1.2}
                  strokeDasharray={n.external ? "5 5" : undefined}
                />
                <text data-fade x={c.x} y={n.sub ? c.y - 4 : c.y + 5} textAnchor="middle" fill="var(--fg)" fontSize="16" fontWeight="500" fontFamily="var(--font-geist-sans)">
                  {n.label}
                </text>
                {n.sub && (
                  <text data-fade x={c.x} y={c.y + 17} textAnchor="middle" fill="var(--muted)" fontSize="11.5" fontFamily="var(--font-geist-mono)">
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="t-label mt-4 max-w-[68ch] !normal-case !tracking-normal">{diagram.caption}</figcaption>
    </figure>
  );
}
