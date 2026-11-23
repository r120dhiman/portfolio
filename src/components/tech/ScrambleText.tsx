"use client";

import { useEffect, useRef, type ElementType, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { scramble } from "./scramble";

type ScrambleOptions = {
  /** Decode once when the element first scrolls into view. */
  inView?: boolean;
  /** Decode again on hover / keyboard focus. */
  hover?: boolean;
  /** Listen for hover on the closest ancestor matching this selector (e.g. "a"). */
  hoverTarget?: string;
  duration?: number;
};

/** Attach glyph-decode behaviour to an element. No-ops under reduced motion. */
export function useScramble(ref: RefObject<HTMLElement | null>, { inView = true, hover = false, hoverTarget, duration = 0.7 }: ScrambleOptions = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let cancel: (() => void) | undefined;
    const run = () => {
      cancel = scramble(el, { duration });
    };

    let io: IntersectionObserver | undefined;
    if (inView) {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          run();
          io?.disconnect();
        },
        { rootMargin: "0px 0px -6% 0px" }
      );
      io.observe(el);
    }

    const target = hover ? ((hoverTarget ? el.closest(hoverTarget) : null) ?? el) : null;
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (target && canHover) target.addEventListener("mouseenter", run);
    if (target) target.addEventListener("focusin", run);

    return () => {
      io?.disconnect();
      target?.removeEventListener("mouseenter", run);
      target?.removeEventListener("focusin", run);
      cancel?.();
    };
  }, [ref, inView, hover, hoverTarget, duration]);
}

type Props = ScrambleOptions & {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
};

/** Mono text that decodes through glyphs on enter (and optionally on hover). */
export function ScrambleText({ children, as: Tag = "span", className, ...opts }: Props) {
  const ref = useRef<HTMLElement>(null);
  useScramble(ref, opts);
  return (
    <Tag ref={ref} className={className} data-scramble="">
      {children}
    </Tag>
  );
}
