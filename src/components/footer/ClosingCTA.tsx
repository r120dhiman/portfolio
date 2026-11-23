"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Magnetic } from "@/components/fx/Magnetic";
import { RollText } from "@/components/sections/RollText";
import { site } from "@/content/site";

/** Big closing call-to-action at the top of the footer (hidden on "/" where Contact already closes the page). */
export function ClosingCTA() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 80%", toggleActions: "play none none none" },
      });
      tl.from("[data-cta-line]", { yPercent: 110, rotate: 2, duration: 1.2, ease: "expo.out", stagger: 0.1 })
        .from("[data-cta-rule]", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0.1)
        .from("[data-cta-fade]", { autoAlpha: 0, y: 16, duration: 0.9, ease: "expo.out", stagger: 0.08 }, 0.35);
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="pb-16 pt-24 md:pb-24 md:pt-36">
      <p data-cta-fade className="t-label flex items-center gap-3">
        <span className="text-accent">{"//"}</span> Next step
      </p>
      <h2 className="t-display mt-8 text-[clamp(2.75rem,10vw,10rem)] md:mt-10">
        <span className="block overflow-hidden pb-[0.06em]">
          <span data-cta-line className="block origin-bottom-left">
            Got a hard problem?
          </span>
        </span>
        <span className="block overflow-hidden pb-[0.12em]">
          <span data-cta-line className="t-serif block origin-bottom-left text-accent">
            Let&rsquo;s ship it.
          </span>
        </span>
      </h2>
      <div data-cta-rule className="mt-10 h-px origin-left bg-line md:mt-14" />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
        <p data-cta-fade className="max-w-md text-sm text-fg/70 md:text-base">
          {site.tagline}
        </p>
        <div data-cta-fade>
          <Magnetic strength={0.25}>
            <a
              href={site.links.email}
              data-cursor-label="Write"
              className="group inline-flex items-center gap-3 rounded-full border border-line px-6 py-4 font-mono text-xs uppercase tracking-[0.08em] outline-none transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-bg focus-visible:border-accent focus-visible:bg-accent focus-visible:text-bg"
            >
              <RollText>{site.email}</RollText>
              <span aria-hidden>→</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
