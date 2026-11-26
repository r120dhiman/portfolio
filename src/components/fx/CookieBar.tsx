"use client";

import { useEffect, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const KEY = "rk:cookie-choice";

/**
 * Cookie consent bar.
 *
 * NOTE: this is UI only. The site currently sets no cookies and loads no analytics, so neither
 * button gates anything — the choice is just persisted to localStorage under `rk:cookie-choice`.
 * When analytics are added, read that value before loading them so "Decline" starts meaning
 * something. Until then it is a visual element, not a consent mechanism.
 */
export function CookieBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(KEY);
    } catch {
      // Private mode / storage blocked — show the bar, don't crash.
    }
    if (!stored) {
      const t = window.setTimeout(() => setVisible(true), 1800);
      return () => window.clearTimeout(t);
    }
  }, []);

  useGSAP(
    () => {
      if (!visible || prefersReducedMotion()) return;
      gsap.from("[data-cookie-bar]", { autoAlpha: 0, y: 24, duration: 0.8, ease: "power3.out" });
    },
    { dependencies: [visible] }
  );

  const choose = (choice: "accepted" | "declined") => {
    try {
      window.localStorage.setItem(KEY, choice);
    } catch {
      // Ignore — dismissing still works for this session.
    }
    if (prefersReducedMotion()) {
      setVisible(false);
      return;
    }
    gsap.to("[data-cookie-bar]", {
      autoAlpha: 0,
      y: 20,
      duration: 0.45,
      ease: "power2.in",
      onComplete: () => setVisible(false),
    });
  };

  if (!visible) return null;

  return (
    <div
      data-cookie-bar
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-[var(--gutter)] bottom-5 z-[57] mx-auto max-w-[min(100%,42rem)] rounded-2xl border border-line bg-bg-2/95 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md md:bottom-7 md:p-6"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <div className="min-w-0">
          <p className="t-label">Cookies</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-fg/80">
            This site uses cookies to understand how it&rsquo;s used. You can accept or decline — either way, nothing breaks.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-full border border-line px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-fg/75 outline-none transition-colors duration-300 hover:border-fg/40 hover:text-fg focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-full bg-accent px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--accent-ink)] outline-none transition-transform duration-300 ease-[var(--ease-out)] hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
