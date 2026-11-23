"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { RevealText } from "@/components/fx/RevealText";
import { SectionLabel } from "@/components/sections/SectionLabel";
import { experience } from "@/content/projects";

const internships = experience.filter((e) => e.kind === "Internship").length;
const leadership = experience.filter((e) => e.kind === "Leadership").length;

export function Experience() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const list = root.querySelector<HTMLElement>("[data-list]");
      const progress = root.querySelector<HTMLElement>("[data-progress]");
      const reduced = prefersReducedMotion();

      if (list && progress) {
        if (reduced) gsap.set(progress, { scaleY: 1 });
        else
          gsap.fromTo(
            progress,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 70%", scrub: 0.6 },
            }
          );
      }

      gsap.utils.toArray<HTMLElement>("[data-row]", root).forEach((row) => {
        const dot = row.querySelector<HTMLElement>("[data-dot]");
        if (dot) {
          gsap.to(dot, {
            backgroundColor: "#ff5a1f",
            borderColor: "#ff5a1f",
            scale: 1.4,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 70%", toggleActions: "play none none reverse" },
          });
        }
        if (reduced) return;
        gsap.from(row.querySelectorAll("[data-reveal]"), {
          y: 48,
          autoAlpha: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: row, start: "top 85%", toggleActions: "play none none none" },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="experience" aria-labelledby="experience-heading" className="gutter relative scroll-mt-20 py-28 md:py-40">
      <SectionLabel aside={`${internships} internships · ${leadership} leadership roles`}>Experience</SectionLabel>

      <RevealText as="h2" className="t-h1 mt-10 max-w-[14ch] md:mt-14">
        <span id="experience-heading">
          Shipping in <span className="t-serif text-accent">production</span>, not just in demos.
        </span>
      </RevealText>

      <div data-list className="relative mt-16 md:mt-24">
        {/* Track + scrubbed progress line */}
        <div aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px bg-line md:left-[calc(25%-0.5px)]" />
        <div
          aria-hidden
          data-progress
          className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-accent md:left-[calc(25%-0.5px)]"
          style={{ transform: "scaleY(0)" }}
        />

        <ol className="group/list relative">
          {experience.map((job) => {
            const current = job.period.includes("Present");
            return (
              <li
                key={job.org}
                data-row
                className="relative grid gap-4 border-b border-line py-10 pl-8 transition-opacity duration-500 group-hover/list:opacity-30 hover:opacity-100! focus-within:opacity-100! md:grid-cols-[25%_minmax(0,1fr)] md:gap-0 md:py-14 md:pl-0"
              >
                <span
                  data-dot
                  aria-hidden
                  className="absolute left-0 top-12 h-[11px] w-[11px] rounded-full border border-line bg-bg md:left-[calc(25%-5.5px)] md:top-[4.25rem]"
                />
                <div className="md:pr-10">
                  <p data-reveal className="t-label tabular-nums">
                    {job.period}
                  </p>
                  <p data-reveal className="t-label mt-2 text-fg/60!">
                    {job.kind === "Internship" ? "Internship" : "Position of responsibility"}
                  </p>
                  {current ? (
                    <p data-reveal className="t-label mt-2 inline-flex items-center gap-2 text-accent!">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                      </span>
                      Current
                    </p>
                  ) : null}
                </div>

                <div className="md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-10 md:pl-10">
                  <div>
                    <h3 data-reveal className="t-h2">
                      {job.link ? (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-label="Visit ↗"
                          className="transition-colors duration-300 hover:text-accent"
                        >
                          {job.org}
                          <span aria-hidden className="ml-2 align-top text-[0.45em] text-accent">
                            ↗
                          </span>
                        </a>
                      ) : (
                        job.org
                      )}
                    </h3>
                    <p data-reveal className="t-serif mt-3 text-xl text-muted md:text-2xl">
                      {job.title}
                    </p>
                  </div>
                  <ul className="mt-6 space-y-3 md:mt-2">
                    {job.points.map((point) => (
                      <li data-reveal key={point} className="flex gap-3 text-[15px] leading-relaxed text-fg/80 md:text-base">
                        <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
