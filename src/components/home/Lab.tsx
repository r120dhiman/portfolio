"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { RevealText } from "@/components/fx/RevealText";
import { SectionLabel } from "@/components/sections/SectionLabel";
import { Magnetic } from "@/components/fx/Magnetic";
import { labProjects, developingSkills } from "@/content/lab";
import { site } from "@/content/site";

const JOIN_SUBJECT = "Joining an in-progress project";

export function Lab() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>("[data-lab-card]").forEach((card, i) => {
        gsap
          .timeline({
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
            delay: i * 0.08,
          })
          .from(card.querySelector("[data-lab-rule]"), { scaleX: 0, transformOrigin: "left", duration: 1.1, ease: "expo.inOut" }, 0)
          .from(card.querySelectorAll("[data-lab-fade]"), { autoAlpha: 0, y: 14, duration: 0.9, ease: "power3.out", stagger: 0.06 }, 0.12);
      });

      gsap.from("[data-dev-skill]", {
        autoAlpha: 0,
        y: 16,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: "[data-dev-grid]", start: "top 88%", toggleActions: "play none none none" },
      });

      gsap.from("[data-lab-join]", {
        autoAlpha: 0,
        y: 18,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-lab-join]", start: "top 92%", toggleActions: "play none none none" },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="lab" aria-labelledby="lab-heading" className="gutter relative scroll-mt-20 py-28 md:py-40">
      <SectionLabel aside={`${labProjects.length} in progress`}>Lab</SectionLabel>

      <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-end md:gap-16">
        <RevealText as="h2" className="t-h1">
          <span id="lab-heading">
            What I&rsquo;m building <span className="t-serif text-accent">right now</span>
          </span>
        </RevealText>
        <p className="max-w-[46ch] text-base leading-relaxed text-muted md:text-lg">
          Unfinished on purpose. Each one has a build log — what works, what doesn&rsquo;t, and what I got wrong. If you want in on one,
          mail me.
        </p>
      </div>

      {/* In-progress projects */}
      <ul className="mt-16 grid gap-px md:mt-24">
        {labProjects.map((p, i) => (
          <li key={p.slug} data-lab-card className="relative">
            <span data-lab-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-line" />
            <Link
              href={`/blog/${p.slug}`}
              data-cursor-label="Read log"
              className="group relative grid gap-5 py-10 md:grid-cols-12 md:items-start md:gap-6 md:py-14"
            >
              <div data-lab-fade className="flex items-center gap-4 md:col-span-3 md:flex-col md:items-start md:gap-3">
                <span className="t-label tabular-nums text-fg/40">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.1em]"
                  style={{ color: p.accent }}
                >
                  <span className="relative flex h-1.5 w-1.5" aria-hidden>
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                      style={{ background: p.accent }}
                    />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
                  </span>
                  {p.stage}
                </span>
                <span className="t-label md:mt-auto">{p.started}</span>
              </div>

              <div className="md:col-span-6">
                <h3
                  data-lab-fade
                  className="text-[clamp(1.7rem,3vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-out)] md:group-hover:translate-x-2"
                >
                  {p.name}
                </h3>
                <p data-lab-fade className="mt-3 max-w-[54ch] leading-relaxed text-fg/70 transition-colors duration-500 group-hover:text-fg/90">
                  {p.oneLiner}
                </p>
                <p data-lab-fade className="t-label mt-5 text-fg/55">
                  Status · <span className="text-fg/80">{p.status}</span>
                </p>
              </div>

              <div data-lab-fade className="md:col-span-3 md:text-right">
                <p className="font-mono text-[0.72rem] uppercase leading-relaxed tracking-[0.06em] text-muted">{p.stack.join(" · ")}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-fg">
                  Build log
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:text-accent"
                  >
                    →
                  </span>
                </span>
              </div>

              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-right scale-x-0 bg-accent transition-transform duration-700 ease-[var(--ease-out)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* Skills under development */}
      <div className="mt-24 border-t border-line pt-8 md:mt-32">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="t-label">Skills in development</p>
          <p className="t-label text-fg/40">Learning in the open · not claimed as strengths</p>
        </div>

        <ul data-dev-grid className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {developingSkills.map((s) => (
            <li key={s.skill} data-dev-skill className="relative border-t border-line pt-5">
              <h3 className="text-[clamp(1.15rem,1.7vw,1.45rem)] font-medium leading-tight tracking-[-0.025em] text-fg">{s.skill}</h3>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-fg/65">{s.why}</p>
              <p className="t-label mt-4 text-fg/45">{s.now}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Join CTA */}
      <div
        data-lab-join
        className="mt-20 grid gap-8 rounded-2xl border border-line bg-bg-2/60 p-8 md:mt-28 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12 md:p-12"
      >
        <div>
          <p className="t-label">Open to collaborators</p>
          <p className="mt-4 max-w-[48ch] text-lg leading-snug tracking-[-0.02em] text-fg md:text-2xl">
            Both of these are better with someone else on them. If one is your thing, mail me and tell me which — that&rsquo;s the whole
            process.
          </p>
        </div>
        <Magnetic strength={0.18}>
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(JOIN_SUBJECT)}`}
            data-cursor-label="Mail"
            className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-[0.78rem] uppercase tracking-[0.1em] text-[var(--accent-ink)] outline-none transition-transform duration-500 ease-[var(--ease-out)] hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Mail me to join
            <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1">
              →
            </span>
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
