"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { ProjectCover } from "@/components/fx/ProjectCover";
import type { Project } from "@/content/projects";

/** Giant "next project" link. On hover a cover card follows the pointer and the name wipes to accent. */
export function NextProject({ project }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const card = cardRef.current;
      if (!el || !card || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (prefersReducedMotion()) return;
      gsap.set(card, { scale: 0.4, opacity: 0 });
      const xTo = gsap.quickTo(card, "x", { duration: 0.7, ease: "power3.out" });
      const yTo = gsap.quickTo(card, "y", { duration: 0.7, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
      };
      const enter = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        gsap.set(card, { x: e.clientX - r.left, y: e.clientY - r.top });
        gsap.to(card, { scale: 1, opacity: 1, rotate: -4, duration: 0.6, ease: "expo.out" });
      };
      const leave = () => gsap.to(card, { scale: 0.4, opacity: 0, rotate: 0, duration: 0.45, ease: "power3.in" });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref }
  );

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      className="group relative block overflow-hidden border-t border-line py-16 md:py-24"
      aria-label={`Next case study: ${project.name}`}
    >
      <div className="flex items-baseline justify-between gap-6">
        <span className="t-label">Next case study</span>
        <span className="t-label hidden md:inline">{project.period}</span>
      </div>
      <div className="relative mt-6">
        <span className="t-display block">
          <span className="relative inline-block">
            <span className="block transition-[clip-path] duration-700 ease-[var(--ease-out)] [clip-path:inset(0_0_0_0)] group-hover:[clip-path:inset(0_100%_0_0)]">
              {project.name}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 block text-accent transition-[clip-path] duration-700 ease-[var(--ease-out)] [clip-path:inset(0_0_0_100%)] group-hover:[clip-path:inset(0_0_0_0)]"
            >
              {project.name}
            </span>
          </span>
          <span className="t-serif ml-4 inline-block text-[0.5em] text-muted transition-transform duration-500 group-hover:translate-x-3">→</span>
        </span>
      </div>
      <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">{project.oneLiner}</p>

      <div
        ref={cardRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 hidden aspect-[16/10] w-[min(30vw,420px)] overflow-hidden rounded-xl opacity-0 shadow-2xl md:block"
        style={{ translate: "-50% -50%" }}
      >
        <ProjectCover project={project} />
      </div>
    </Link>
  );
}
