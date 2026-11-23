"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "@/components/fx/SmoothScroll";
import { site } from "@/content/site";

/**
 * Preloader event contract
 * ------------------------
 * When the boot overlay starts opening (or immediately on repeat visits /
 * reduced motion) we:
 *   1. set `document.documentElement.dataset.loaded = "true"`
 *   2. dispatch `window` event "preloader:done"
 * Use `onPreloaderDone(cb)` to subscribe safely: it calls `cb` right away if
 * the preloader already finished, and returns an unsubscribe function.
 */
export const PRELOADER_DONE = "preloader:done";
const SEEN_KEY = "rk:booted";

export function onPreloaderDone(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (document.documentElement.dataset.loaded === "true") {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(PRELOADER_DONE, handler, { once: true });
  return () => window.removeEventListener(PRELOADER_DONE, handler);
}

function markDone() {
  if (document.documentElement.dataset.loaded === "true") return;
  document.documentElement.dataset.loaded = "true";
  window.dispatchEvent(new Event(PRELOADER_DONE));
}

function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

const LINES: { cmd: string; tag?: string }[] = [
  { cmd: "mount app router · react 19" },
  { cmd: "init langgraph runtime" },
  { cmd: "connect redis streams" },
  { cmd: "warm gemini live session" },
  { cmd: "load neo4j deal graph" },
  { cmd: "compile shaders" },
  { cmd: "hello, world", tag: "ready" },
];

/** Runs during HTML parsing so repeat visits / reduced motion never paint the overlay. */
const SKIP_SCRIPT = `(function(){try{var b=document.getElementById("rk-boot");if(!b)return;var s=false;try{s=sessionStorage.getItem("${SEEN_KEY}")==="1"}catch(e){}if(s||matchMedia("(prefers-reduced-motion: reduce)").matches){b.style.display="none"}}catch(e){}})()`;

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const booting = useRef(false);

  // Lenis is created by a parent effect (runs after ours), so follow it here.
  useEffect(() => {
    lenisRef.current = lenis;
    if (lenis && booting.current) lenis.stop();
  }, [lenis]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const html = document.documentElement;

    const hide = () => {
      el.style.display = "none";
    };

    if (html.dataset.loaded === "true" || seenThisSession() || prefersReducedMotion()) {
      hide();
      markDone();
      return;
    }

    booting.current = true;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    lenisRef.current?.stop();
    window.scrollTo(0, 0);

    const release = () => {
      if (!booting.current) return;
      booting.current = false;
      html.style.overflow = prevOverflow;
      lenisRef.current?.start();
    };

    const q = gsap.utils.selector(el);
    const counter = q("[data-counter]")[0] as HTMLElement;
    const bar = q("[data-bar]");
    const lines = q("[data-line]");
    const oks = q("[data-ok]");
    const progress = { v: 0 };

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
        hide();
      },
    });

    tl.set(el, { display: "block" })
      .from(q("[data-head]"), { yPercent: 100, opacity: 0, duration: 0.5, stagger: 0.05 }, 0)
      .to(
        progress,
        {
          v: 100,
          duration: 1.3,
          ease: "power2.inOut",
          onUpdate: () => {
            const n = Math.round(progress.v);
            counter.textContent = String(n).padStart(3, "0");
          },
        },
        0.05
      )
      .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0.05)
      .to(lines, { opacity: 1, x: 0, duration: 0.25, stagger: 0.16 }, 0.1)
      .to(oks, { opacity: 1, duration: 0.1, stagger: 0.16 }, 0.24)
      // Seam ignites, content lifts, panels split open.
      .fromTo(q("[data-seam]"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "expo.out" }, 1.35)
      .to(q("[data-content]"), { yPercent: -6, opacity: 0, duration: 0.3, ease: "power2.in" }, 1.4)
      .call(() => {
        release();
        markDone();
        el.style.pointerEvents = "none";
      }, undefined, 1.6)
      .to(q("[data-panel='top']"), { yPercent: -100, duration: 0.6, ease: "expo.inOut" }, 1.6)
      .to(q("[data-panel='bottom']"), { yPercent: 100, duration: 0.6, ease: "expo.inOut" }, 1.6)
      .to(q("[data-seam]"), { scaleY: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, 1.6);

    return () => {
      tl.kill();
      release();
    };
  }, []);

  return (
    <>
      <div
        id="rk-boot"
        ref={root}
        suppressHydrationWarning
        aria-hidden="true"
        className="fixed inset-0 z-[100] cursor-progress"
      >
        <div data-panel="top" className="absolute inset-x-0 top-0 h-[50.5%] bg-bg" />
        <div data-panel="bottom" className="absolute inset-x-0 bottom-0 h-[50.5%] bg-bg" />
        <div data-seam className="absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 bg-accent" />

        <div data-content className="gutter absolute inset-0 flex flex-col justify-between py-6 md:py-8">
          <div className="flex items-start justify-between overflow-hidden">
            <span data-head className="t-label">
              {site.name}
            </span>
            <span data-head className="t-label">
              boot / {site.domain}
            </span>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <ol className="w-full max-w-md font-mono text-[11px] leading-[1.9] text-muted sm:text-xs">
              {LINES.map((l) => (
                <li key={l.cmd} data-line className="flex translate-x-[-8px] items-baseline gap-2 opacity-0">
                  <span className="text-accent">&gt;</span>
                  <span className={l.tag ? "text-fg" : undefined}>{l.cmd}</span>
                  <span className="mx-1 h-px flex-1 translate-y-[-3px] bg-line" />
                  <span data-ok className={l.tag ? "text-accent opacity-0" : "text-fg opacity-0"}>
                    {l.tag ?? "ok"}
                  </span>
                </li>
              ))}
            </ol>

            <div className="flex flex-col items-end">
              <span
                data-counter
                className="font-mono text-[clamp(4.5rem,18vw,12rem)] leading-[0.8] font-medium tracking-[-0.06em] text-fg tabular-nums"
              >
                000
              </span>
              <div className="mt-4 h-px w-full min-w-40 bg-line">
                <div data-bar className="h-full origin-left scale-x-0 bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }}
      />
      <noscript>
        <style>{`#rk-boot{display:none!important}`}</style>
      </noscript>
    </>
  );
}
