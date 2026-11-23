"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Infinite marquee whose speed and direction react to scroll velocity. */
export function Marquee({ children, speed = 40, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = ref.current?.querySelector<HTMLElement>("[data-track]");
      if (!track || prefersReducedMotion()) return;
      const tween = gsap.to(track, { xPercent: -50, ease: "none", duration: speed, repeat: -1 });
      const st = ScrollTrigger.create({
        onUpdate(self) {
          const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
          gsap.to(tween, { timeScale: v === 0 ? 1 : v, duration: 0.3, overwrite: true });
          gsap.to(tween, { timeScale: self.direction, duration: 1.2, delay: 0.3 });
        },
      });
      return () => st.kill();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <div data-track className="inline-flex w-max">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
