"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

type Section = { id: string; label: string };

/**
 * Sticky side progress nav (desktop) + thin top progress bar (mobile).
 * Tracks which case-study section is in view.
 */
export function CaseNav({ sections, articleId }: { sections: readonly Section[]; articleId: string }) {
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const triggers: ScrollTrigger[] = [];
    sections.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(i),
        })
      );
    });
    const article = document.getElementById(articleId);
    if (article) {
      triggers.push(
        ScrollTrigger.create({
          trigger: article,
          start: "top 45%",
          end: "bottom 60%",
          onUpdate: (self) => {
            const p = self.progress.toFixed(4);
            barRef.current?.style.setProperty("--p", p);
            mobileBarRef.current?.style.setProperty("--p", p);
          },
        })
      );
    }
    return () => triggers.forEach((t) => t.kill());
  }, [sections, articleId]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] lg:hidden" aria-hidden>
        <div ref={mobileBarRef} className="h-full origin-left bg-accent" style={{ transform: "scaleX(var(--p, 0))" }} />
      </div>
      <nav aria-label="Case study sections" className="sticky top-28 hidden lg:block">
        <p className="t-label mb-5">On this page</p>
        <div className="relative pl-5">
          <div className="absolute bottom-1 left-0 top-1 w-px bg-line" aria-hidden />
          <div
            ref={barRef}
            className="absolute bottom-1 left-0 top-1 w-px origin-top bg-accent"
            style={{ transform: "scaleY(var(--p, 0))" }}
            aria-hidden
          />
          <ol className="space-y-3">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === i ? "location" : undefined}
                  className={clsx(
                    "group flex items-baseline gap-3 text-sm transition-colors duration-300",
                    active === i ? "text-fg" : "text-muted hover:text-fg"
                  )}
                >
                  <span className={clsx("font-mono text-[0.7rem] tabular-nums", active === i && "text-accent")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={clsx("transition-transform duration-300", active === i && "translate-x-1")}>{s.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
