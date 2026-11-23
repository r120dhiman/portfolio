"use client";

import { useRef } from "react";
import clsx from "clsx";
import type { Project } from "@/content/projects";
import { ProjectCover } from "@/components/fx/ProjectCover";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Floating cover that trails the cursor. Skews/rotates with pointer velocity
 * and crossfades (with a clip wipe) between projects. Desktop-only; the parent
 * decides whether to mount it.
 */
export function CursorPreview({ projects, active }: { projects: Project[]; active: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = active !== null;

  // Follow + velocity skew.
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.set(el, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "expo.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "expo.out" });
      const rTo = gsap.quickTo(el, "rotation", { duration: 0.9, ease: "expo.out" });
      const sTo = gsap.quickTo(el, "skewX", { duration: 0.9, ease: "expo.out" });

      let lastX = 0;
      let lastT = 0;
      let settle: ReturnType<typeof setTimeout> | undefined;
      const move = (e: PointerEvent) => {
        const now = performance.now();
        const dt = Math.max(16, now - lastT);
        const vx = lastT ? (e.clientX - lastX) / dt : 0; // px per ms
        lastX = e.clientX;
        lastT = now;
        xTo(e.clientX);
        yTo(e.clientY);
        rTo(gsap.utils.clamp(-14, 14, vx * 9));
        sTo(gsap.utils.clamp(-12, 12, vx * -7));
        clearTimeout(settle);
        settle = setTimeout(() => {
          rTo(0);
          sTo(0);
        }, 90);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => {
        window.removeEventListener("pointermove", move);
        clearTimeout(settle);
      };
    },
    { scope: ref }
  );

  // Show / hide.
  useGSAP(
    () => {
      gsap.to(ref.current, {
        scale: visible ? 1 : 0.6,
        autoAlpha: visible ? 1 : 0,
        duration: visible ? 0.7 : 0.45,
        ease: visible ? "expo.out" : "power3.out",
        overwrite: "auto",
      });
    },
    { dependencies: [visible], scope: ref }
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none invisible fixed left-0 top-0 z-40 aspect-[4/3] w-[clamp(240px,24vw,400px)] opacity-0 will-change-transform"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[4px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        {projects.map((p) => {
          const on = p.slug === active;
          return (
            <div
              key={p.slug}
              className={clsx(
                "absolute inset-0 transition-[opacity,clip-path,transform] duration-700 ease-[var(--ease-out)]",
                on ? "z-10 opacity-100 [clip-path:inset(0_0_0_0)]" : "z-0 opacity-0 [clip-path:inset(100%_0_0_0)]"
              )}
            >
              <div className={clsx("h-full w-full transition-transform duration-1000 ease-[var(--ease-out)]", on ? "scale-100" : "scale-125")}>
                <ProjectCover project={p} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
