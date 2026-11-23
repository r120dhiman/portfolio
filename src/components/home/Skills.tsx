"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { RevealText } from "@/components/fx/RevealText";
import { SectionLabel } from "@/components/sections/SectionLabel";
import { skills } from "@/content/projects";
import { site } from "@/content/site";

export function Skills() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-skill-col]").forEach((col, i) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: col, start: "top 85%", toggleActions: "play none none none" },
          delay: i * 0.06,
        });
        tl.from(col.querySelector("[data-col-line]"), { scaleY: 0, transformOrigin: "top", duration: 1.2, ease: "expo.inOut" }, 0)
          .from(col.querySelector("[data-col-head]"), { autoAlpha: 0, y: 12, duration: 0.8, ease: "power3.out" }, 0.1)
          .from(col.querySelectorAll("[data-skill]"), { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.05 }, 0.15);
      });
      gsap.from("[data-edu]", {
        autoAlpha: 0,
        y: 16,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-edu]", start: "top 92%", toggleActions: "play none none none" },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="skills" aria-labelledby="skills-heading" className="gutter relative scroll-mt-20 py-28 md:py-40">
      <SectionLabel aside={`${skills.reduce((n, g) => n + g.items.length, 0)} tools`}>Toolkit</SectionLabel>

      <RevealText as="h2" className="t-h1 mt-10 md:mt-14">
        <span id="skills-heading">
          What I <span className="t-serif text-accent">build with</span>
        </span>
      </RevealText>

      <div className="mt-14 grid grid-cols-2 gap-y-12 md:mt-20 md:grid-cols-3 lg:grid-cols-5">
        {skills.map((g, gi) => (
          <div key={g.group} data-skill-col className="relative pl-4 pr-2 md:pl-6">
            <span data-col-line aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line" />
            <h3 data-col-head className="t-label flex items-baseline gap-3">
              <span className="tabular-nums text-fg/40">{String(gi + 1).padStart(2, "0")}</span>
              <span className="text-fg">{g.group}</span>
            </h3>
            <ul className="mt-6 space-y-1.5">
              {g.items.map((item) => (
                <li key={item} className="overflow-hidden">
                  <span
                    data-skill
                    className="block text-[clamp(1.15rem,1.9vw,1.6rem)] leading-[1.25] tracking-[-0.02em] text-fg/85 transition-colors duration-300 hover:text-accent"
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div data-edu className="mt-20 border-t border-line pt-8 md:mt-28">
        <p className="t-label">Education</p>
        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-16">
          <div>
            <p className="text-lg font-medium tracking-[-0.02em] text-fg md:text-2xl">{site.education.school}</p>
            <p className="t-serif mt-1 text-lg text-muted md:text-xl">{site.education.degree}</p>
            <p className="t-label mt-3 tabular-nums">
              {site.education.years} · CPI <span className="text-accent">{site.education.cpi}</span>
            </p>
          </div>
          <div>
            <p className="text-base text-fg/85 md:text-lg">{site.schooling.school}</p>
            <ul className="mt-3 space-y-1.5">
              {site.schooling.results.map((r) => (
                <li key={r.level} className="flex flex-wrap items-baseline gap-x-3">
                  <span className="t-label">{r.level}</span>
                  <span className="tabular-nums text-fg">{r.score}</span>
                  {r.detail ? <span className="text-sm text-muted">{r.detail}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
