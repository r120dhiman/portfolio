"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { RollText } from "@/components/sections/RollText";
import { HashLink } from "@/components/sections/HashLink";
import { ClosingCTA } from "@/components/footer/ClosingCTA";
import { StatusPanel } from "@/components/footer/StatusPanel";
import { BackToTop } from "@/components/footer/BackToTop";
import { Wordmark } from "@/components/footer/Wordmark";
import { AsciiField } from "@/components/footer/AsciiField";
import { site, nav } from "@/content/site";

const elsewhere = [
  { label: "Email", href: site.links.email, external: false },
  { label: "GitHub", href: site.links.github, external: true },
  { label: "LinkedIn", href: site.links.linkedin, external: true },
] as const;

const linkCls = "group flex items-center gap-3 py-1 outline-none focus-visible:text-accent";

function Arrow() {
  return (
    <span aria-hidden className="relative inline-block h-[1em] w-[1em] overflow-hidden leading-none text-accent">
      <span className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0">
        ↗
      </span>
    </span>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute z-10 h-3 w-3 border-accent/70 ${className}`} />
  );
}

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const markZoneRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Footer sits in the layout across routes: keep ScrollTrigger positions fresh when page height changes.
  useEffect(() => {
    let t: number | undefined;
    let lastH = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Crosshair that tracks the cursor (fine pointers only).
  useEffect(() => {
    const root = ref.current;
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion()) return;
    const hLine = root.querySelector<HTMLElement>("[data-cross-h]");
    const vLine = root.querySelector<HTMLElement>("[data-cross-v]");
    const setX = vLine ? gsap.quickTo(vLine, "x", { duration: 0.35, ease: "power3.out" }) : null;
    const setY = hLine ? gsap.quickTo(hLine, "y", { duration: 0.35, ease: "power3.out" }) : null;
    const lines = [hLine, vLine].filter(Boolean) as HTMLElement[];
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      setX?.(x);
      setY?.(y);
    };
    const enter = () => gsap.to(lines, { autoAlpha: 1, duration: 0.4 });
    const leave = () => gsap.to(lines, { autoAlpha: 0, duration: 0.4 });
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    return () => {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(lines);
    };
  }, []);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      // The footer "opens up" from an inset card to full bleed as it scrolls in.
      gsap.fromTo(
        root,
        { clipPath: "inset(4% 2.5% 0% 2.5% round 28px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "top 25%", scrub: 0.6 },
        }
      );
      gsap.from("[data-foot-rule]", {
        scaleX: 0,
        duration: 1.4,
        ease: "expo.inOut",
        stagger: 0.12,
        scrollTrigger: { trigger: "[data-foot-grid]", start: "top 85%", toggleActions: "play none none none" },
      });
      gsap.from("[data-foot-meta]", {
        autoAlpha: 0,
        y: 24,
        duration: 1,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: "[data-foot-grid]", start: "top 85%", toggleActions: "play none none none" },
      });
      gsap.fromTo("[data-foot-panel]", { clipPath: "inset(-4% -4% 100% -4%)" }, {
        clipPath: "inset(-4% -4% -4% -4%)",
        duration: 1.3,
        ease: "expo.inOut",
        clearProps: "clipPath",
        scrollTrigger: { trigger: "[data-foot-grid]", start: "top 85%", toggleActions: "play none none none" },
      });
    },
    { scope: ref }
  );

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden border-t border-line bg-bg-2 [background-image:linear-gradient(to_right,rgb(236_235_230/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(236_235_230/0.035)_1px,transparent_1px)] [background-size:64px_64px]"
    >
      {/* scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-60 [background:repeating-linear-gradient(to_bottom,rgb(0_0_0/0.18)_0_1px,transparent_1px_3px)]"
      />
      {/* crosshair */}
      <div aria-hidden data-cross-h className="pointer-events-none invisible absolute inset-x-0 top-0 z-[2] h-px bg-accent/25" />
      <div aria-hidden data-cross-v className="pointer-events-none invisible absolute inset-y-0 left-0 z-[2] w-px bg-accent/25" />

      <div className="gutter relative z-[3]">
        {pathname !== "/" ? <ClosingCTA /> : null}

        {/* top status strip */}
        <div className={`t-label flex items-center justify-between gap-4 ${pathname === "/" ? "pt-14 md:pt-20" : ""}`}>
          <span data-foot-meta className="flex items-center gap-2">
            <span className="text-accent">■</span> sys/footer — v2026.11
          </span>
          <span data-foot-meta className="hidden tabular-nums md:inline">
            Varanasi · 25.32°N 82.97°E
          </span>
          <span data-foot-meta className="tabular-nums md:hidden">{site.domain}</span>
        </div>
        <div data-foot-rule className="mt-4 h-px origin-left bg-line" />

        <div
          data-foot-grid
          className="grid grid-cols-[minmax(0,1fr)] gap-12 pt-10 md:pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto] lg:gap-16"
        >
          <div data-foot-panel className="relative min-w-0">
            <Corner className="-left-1 -top-1 border-l border-t" />
            <Corner className="-right-1 -top-1 border-r border-t" />
            <Corner className="-bottom-1 -left-1 border-b border-l" />
            <Corner className="-bottom-1 -right-1 border-b border-r" />
            <StatusPanel />
          </div>

          <nav aria-label="Footer" className="grid min-w-0 grid-cols-2 gap-6 self-start sm:gap-8 font-mono text-sm uppercase tracking-[0.08em]">
            <div>
              <p data-foot-meta className="t-label mb-4">
                <span className="text-accent">[01]</span> Index
              </p>
              <ul className="flex flex-col gap-1.5">
                {nav.map((l, i) => (
                  <li key={l.href} data-foot-meta>
                    <HashLink href={l.href} className={linkCls}>
                      <span className="w-5 text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <RollText>{l.label}</RollText>
                      <Arrow />
                    </HashLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p data-foot-meta className="t-label mb-4">
                <span className="text-accent">[02]</span> Elsewhere
              </p>
              <ul className="flex flex-col gap-1.5">
                {elsewhere.map((l, i) => (
                  <li key={l.label} data-foot-meta>
                    <a
                      href={l.href}
                      {...(l.external
                        ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${l.label} (opens in new tab)` }
                        : {})}
                      data-cursor-label={l.external ? "Open" : "Write"}
                      className={linkCls}
                    >
                      <span className="w-5 text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <RollText>{l.label}</RollText>
                      <Arrow />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div data-foot-meta className="flex items-end justify-between gap-6 lg:flex-col lg:items-end lg:justify-start">
            <p className="t-label max-w-[14rem] lg:text-right">
              Back to the
              <br />
              <span className="text-fg">beginning</span>
            </p>
            <BackToTop />
          </div>
        </div>

        <div data-foot-rule className="mt-14 h-px origin-left bg-line md:mt-20" />
        <div className="t-label flex flex-wrap justify-between gap-x-6 gap-y-2 pt-5">
          <span data-foot-meta>© 2026 {site.name}</span>
          <span data-foot-meta className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Open to full-time roles · 2027
          </span>
          <span data-foot-meta>Built with Next.js, GSAP &amp; WebGL</span>
        </div>
      </div>

      {/* wordmark over a cursor-reactive ASCII field */}
      <div ref={markZoneRef} className="relative z-[3] mt-4 pt-16 md:pt-24">
        <AsciiField
          trackRef={markZoneRef}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-70 [mask-image:linear-gradient(to_bottom,transparent,black_35%)]"
        />
        <Wordmark text={site.name.toUpperCase()} className="gutter relative pb-2 md:pb-3" />
      </div>
    </footer>
  );
}
