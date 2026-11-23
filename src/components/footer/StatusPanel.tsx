"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/content/site";

if (typeof window !== "undefined") gsap.registerPlugin(ScrambleTextPlugin);

const istFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, "0");
const fmtUptime = (ms: number) => {
  const s = ms / 1000;
  return `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}`;
};

function Row({ k, label }: { k: string; label: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-line/80 py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd data-k={k} className="tabular-nums text-fg">
        --
      </dd>
    </div>
  );
}

type Line = { text: string; tag?: string };

/**
 * Cosmetic "system status" terminal. Every number in here is real and about *this visitor's
 * session* (time since page load, frame rate, TTFB from Navigation Timing, viewport, scroll),
 * nothing about servers or traffic. Pauses while offscreen or the tab is hidden.
 */
export function StatusPanel({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLOListElement>(null);
  const pathname = usePathname();
  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // Live readouts — written straight to the DOM, no React re-renders.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = (k: string) => root.querySelector<HTMLElement>(`[data-k="${k}"]`)!;
    const el = { up: q("up"), ist: q("ist"), fps: q("fps"), ttfb: q("ttfb"), vp: q("vp"), scroll: q("scroll") };

    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    el.ttfb.textContent = nav && nav.responseStart > 0 ? `${Math.round(nav.responseStart)}ms` : "n/a";

    let visible = false;
    let interval = 0;
    let raf = 0;
    let frames = 0;
    let since = performance.now();

    const tick = () => {
      el.up.textContent = fmtUptime(performance.now());
      el.ist.textContent = istFmt.format(new Date());
      el.vp.textContent = `${window.innerWidth}×${window.innerHeight} @${Math.min(window.devicePixelRatio || 1, 9).toFixed(1)}x`;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.scroll.textContent = `${max > 0 ? Math.round((window.scrollY / max) * 100) : 100}%`;
      const now = performance.now();
      if (now - since >= 500) {
        el.fps.textContent = String(Math.round((frames * 1000) / (now - since)));
        frames = 0;
        since = now;
      }
    };
    const count = () => {
      frames++;
      raf = requestAnimationFrame(count);
    };

    const start = () => {
      if (interval || !visible || document.hidden) return;
      frames = 0;
      since = performance.now();
      tick();
      interval = window.setInterval(tick, 250);
      raf = requestAnimationFrame(count);
    };
    const stop = () => {
      window.clearInterval(interval);
      cancelAnimationFrame(raf);
      interval = raf = 0;
    };

    tick();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(root);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Log stream: boot lines scramble in when the panel enters view, then a heartbeat line every few seconds.
  useEffect(() => {
    const root = rootRef.current;
    const log = logRef.current;
    if (!root || !log) return;
    const reduce = prefersReducedMotion();
    const MAX = 6;
    const tweens: gsap.core.Tween[] = [];
    let booted = false;
    let visible = false;
    let hb = 0;
    let seq = 0;

    const push = (line: Line, animate: boolean) => {
      const li = document.createElement("li");
      li.className = "flex gap-2 whitespace-nowrap";
      const caret = document.createElement("span");
      caret.className = "text-accent";
      caret.textContent = ">";
      const body = document.createElement("span");
      body.className = "min-w-0 truncate text-fg/80";
      li.append(caret, body);
      if (line.tag) {
        const tag = document.createElement("span");
        tag.className = "ml-auto shrink-0 pl-3 text-accent";
        tag.textContent = line.tag;
        li.append(tag);
        if (animate) gsap.from(tag, { autoAlpha: 0, duration: 0.2, delay: 0.55 });
      }
      log.append(li);
      while (log.children.length > MAX) log.firstElementChild?.remove();
      if (animate) {
        tweens.push(
          gsap.to(body, {
            duration: 0.6,
            ease: "none",
            scrambleText: { text: line.text, chars: "01#%▓░<>/", revealDelay: 0.1, speed: 0.6 },
          })
        );
      } else body.textContent = line.text;
    };

    const bootLines = (): Line[] => [
      { text: `boot ${site.domain}`, tag: "ok" },
      { text: "load next@16 · react@19 · gsap · webgl", tag: "ok" },
      { text: `mount route ${pathRef.current}`, tag: "ok" },
      { text: `whoami → ${site.name.toLowerCase()}, software engineer` },
      { text: "all systems nominal", tag: "●" },
    ];

    const heartbeat = () => {
      seq++;
      const msgs: Line[] = [
        { text: `heartbeat #${pad(seq, 3)} · ${istFmt.format(new Date())} IST`, tag: "ok" },
        { text: `route ${pathRef.current} · scroll ${Math.round((window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100)}%`, tag: "ok" },
        { text: "inbox open → " + site.email, tag: "●" },
      ];
      push(msgs[seq % msgs.length], true);
    };

    const startHb = () => {
      if (hb || reduce || !booted || !visible || document.hidden) return;
      hb = window.setInterval(heartbeat, 3200);
    };
    const stopHb = () => {
      window.clearInterval(hb);
      hb = 0;
    };

    const boot = () => {
      booted = true;
      if (reduce) {
        bootLines().forEach((l) => push(l, false));
        return;
      }
      const lines = bootLines();
      lines.forEach((l, i) => tweens.push(gsap.delayedCall(i * 0.45, () => push(l, true))));
      tweens.push(gsap.delayedCall(lines.length * 0.45 + 1.5, startHb));
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !booted) boot();
        else if (visible) startHb();
        else stopHb();
      },
      { threshold: 0.3 }
    );
    io.observe(root);
    const onVis = () => (document.hidden ? stopHb() : startHb());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopHb();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      tweens.forEach((t) => t.kill());
      log.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden border border-line bg-bg-2/60 font-mono text-[11px] uppercase leading-relaxed tracking-[0.06em] backdrop-blur-sm ${className ?? ""}`}
    >
      {/* title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-muted">
        <span className="truncate">rk@{site.domain}: ~/status</span>
        <span className="flex shrink-0 items-center gap-2 text-fg">
          <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ddc84] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3ddc84]" />
          </span>
          live
        </span>
      </div>

      <div className="grid gap-x-6 px-4 pt-3 sm:grid-cols-2">
        <dl>
          <Row k="up" label="session uptime" />
          <Row k="ist" label="varanasi · ist" />
          <Row k="fps" label="your fps" />
        </dl>
        <dl>
          <Row k="ttfb" label="ttfb (this load)" />
          <Row k="vp" label="viewport" />
          <Row k="scroll" label="scrolled" />
        </dl>
      </div>

      <ol ref={logRef} aria-hidden className="flex h-[8.5rem] flex-col justify-end gap-0.5 overflow-hidden px-4 pb-1 pt-3" />

      <div className="flex items-center gap-2 border-t border-line px-4 py-2.5 text-fg/80">
        <span className="text-accent">$</span>
        <span className="truncate normal-case tracking-normal">{site.status}</span>
        <span aria-hidden className="ml-0.5 inline-block h-3 w-[7px] shrink-0 animate-[rk-blink_1s_steps(1)_infinite] bg-accent" />
      </div>
      <style>{`@keyframes rk-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
