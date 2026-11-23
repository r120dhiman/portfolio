"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Magnetic } from "@/components/fx/Magnetic";
import { ShaderField } from "@/components/fx/ShaderField";
import { onPreloaderDone } from "@/components/fx/Preloader";
import { site } from "@/content/site";

const LIQUID_ID = "hero-liquid";

const socials = [
  { label: "GitHub", href: site.links.github, external: true },
  { label: "LinkedIn", href: site.links.linkedin, external: true },
  { label: "Email", href: site.links.email, external: false },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const name = q("[data-name]")[0] as HTMLElement;
      const nameLines = q("[data-name-line]") as HTMLElement[];
      const content = q("[data-content]")[0] as HTMLElement;
      const reduced = prefersReducedMotion();
      const touch = window.matchMedia("(hover: none)").matches;

      if (reduced) return; // Static, fully visible hero.

      // ---------- Intro: liquid name ----------
      const nameSplits = nameLines.map((line) => SplitText.create(line, { type: "chars", aria: "none" }));
      const chars = nameSplits.flatMap((s) => s.chars as HTMLElement[]);
      const role = SplitText.create(q("[data-role]"), { type: "lines", mask: "lines", aria: "none" });
      const disp = q(`#${LIQUID_ID} feDisplacementMap`)[0];
      const turb = q(`#${LIQUID_ID} feTurbulence`)[0];
      const liquid = { scale: touch ? 0 : 90, freq: 0.012 };

      gsap.set(chars, { yPercent: 115, scaleY: 1.9, rotate: 6, opacity: 0, filter: "blur(14px)", transformOrigin: "50% 100%" });
      gsap.set(role.lines, { yPercent: 110 });
      gsap.set(q("[data-fade]"), { y: 24, opacity: 0 });

      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
        onStart: () => {
          if (!touch) name.style.filter = `url(#${LIQUID_ID})`;
        },
        onComplete: () => {
          name.style.filter = "";
        },
      });
      intro
        .to(chars, {
          yPercent: 0,
          scaleY: 1,
          rotate: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.5,
          stagger: { each: 0.05, from: "start" },
        })
        .to(
          liquid,
          {
            scale: 0,
            freq: 0.004,
            duration: 2,
            ease: "power3.out",
            onUpdate: () => {
              disp?.setAttribute("scale", liquid.scale.toFixed(2));
              turb?.setAttribute("baseFrequency", `${liquid.freq.toFixed(4)} ${(liquid.freq * 2.4).toFixed(4)}`);
            },
          },
          0
        )
        .to(role.lines, { yPercent: 0, duration: 1.1, stagger: 0.08 }, 0.55)
        .to(q("[data-fade]"), { y: 0, opacity: 1, duration: 1, stagger: 0.07 }, 0.75)
        // Clear inline filters so the scroll blur below owns them.
        .set(chars, { clearProps: "filter" });

      const unsubscribe = onPreloaderDone(() => intro.play());

      // ---------- Scroll cue ----------
      gsap.fromTo(
        q("[data-cue]"),
        { xPercent: -100 },
        { xPercent: 100, duration: 1.6, ease: "power2.inOut", repeat: -1, repeatDelay: 0.3 }
      );

      // ---------- Scroll out: parallax, scale, split + blur ----------
      const out = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });
      out
        .to(content, { yPercent: 22, scale: 0.92, opacity: 0.15, transformOrigin: "50% 0%" }, 0)
        .to(nameLines[0], { xPercent: -14, ...(touch ? {} : { filter: "blur(10px)" }) }, 0)
        .to(nameLines[1], { xPercent: 14, ...(touch ? {} : { filter: "blur(10px)" }) }, 0)
        .to(
          chars,
          {
            x: (i: number, _el: Element, arr: Element[]) => (i - (arr.length - 1) / 2) * 0.012 * window.innerWidth,
            y: (i: number) => (i % 2 ? -1 : 1) * 0.015 * window.innerHeight,
          },
          0
        );

      return () => {
        unsubscribe();
        name.style.filter = "";
        nameSplits.forEach((s) => s.revert());
        role.revert();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      aria-label="Introduction"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden portrait:min-h-[min(100svh,56rem)]"
    >
      <ShaderField className="absolute inset-0 -z-10" />
      {/* Soft floor so the next section blends in. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-bg" />

      {/* SVG filter for the liquid intro (applied only while animating). */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={LIQUID_ID} x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.0288" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div data-content className="gutter relative flex flex-1 flex-col justify-between pt-28 pb-24 will-change-transform md:pt-32 md:pb-24">
        <div data-fade className="flex items-center gap-3">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <p className="t-label max-w-[40ch] leading-relaxed text-fg/80">{site.status}</p>
        </div>

        <div className="mt-16 flex flex-col gap-10 md:mt-0">
          <h1
            data-name
            aria-label={site.name}
            className="font-medium text-[clamp(3.5rem,min(18.5vw,32svh),19rem)] leading-[0.82] tracking-[-0.055em] text-fg select-none"
          >
            <span data-name-line aria-hidden className="block whitespace-nowrap will-change-transform">
              Rohit
            </span>
            <span
              data-name-line
              aria-hidden
              className="block whitespace-nowrap pl-[12vw] will-change-transform md:pl-[22vw]"
            >
              Kumar<span className="text-accent">.</span>
            </span>
          </h1>

          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p
                data-role
                className="max-w-[22ch] text-[clamp(1.6rem,3.4vw,3rem)] leading-[1.02] font-medium tracking-[-0.03em] text-fg"
              >
                Software engineer building <span className="t-serif text-accent">AI&nbsp;products</span> end to end.
              </p>
              <p data-fade className="mt-5 max-w-[52ch] text-sm leading-relaxed text-muted md:text-base">
                {site.tagline}
              </p>
            </div>

            <div className="flex flex-col gap-6 md:col-span-5 md:items-end">
              <div data-fade className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <a
                    href="#work"
                    className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-[#0b0b0a] transition-colors hover:bg-fg"
                  >
                    See the work
                    <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-y-0.5">
                      ↓
                    </span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <Link
                    href="/resume"
                    className="inline-flex items-center gap-3 rounded-full border border-line px-6 py-3.5 text-sm font-medium text-fg transition-colors hover:border-fg"
                  >
                    Resume
                    <span aria-hidden>↗</span>
                  </Link>
                </Magnetic>
              </div>
              <ul data-fade className="flex flex-wrap gap-x-6 gap-y-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <Magnetic strength={0.25}>
                      <a
                        href={s.href}
                        {...(s.external ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="t-label inline-block py-1 text-fg/70 transition-colors hover:text-accent"
                      >
                        {s.label}
                      </a>
                    </Magnetic>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#work"
        data-fade
        aria-label="Scroll to work"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 [@media(max-height:560px)]:hidden"
      >
        <span className="t-label">Scroll</span>
        <span className="relative h-px w-12 overflow-hidden bg-line">
          <span data-cue className="absolute inset-0 bg-accent" />
        </span>
      </a>
    </section>
  );
}
