"use client";

import { useRef, type ElementType } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  /** "lines" slides masked lines up; "words" staggers words; "chars" for short display text. */
  by?: "lines" | "words" | "chars";
  delay?: number;
  /** Start when scrolled into view (default) or immediately on mount. */
  trigger?: "scroll" | "mount";
};

/** Masked text reveal. Use for headings and short paragraphs. */
export function RevealText({ children, as: Tag = "div", className, by = "lines", delay = 0, trigger = "scroll" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const split = SplitText.create(ref.current, {
        type: by === "lines" ? "lines" : by === "words" ? "lines,words" : "lines,chars",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          const targets = by === "lines" ? self.lines : by === "words" ? self.words : self.chars;
          return gsap.from(targets, {
            yPercent: 110,
            duration: by === "chars" ? 1 : 1.1,
            ease: "expo.out",
            stagger: by === "chars" ? 0.025 : by === "words" ? 0.04 : 0.09,
            delay,
            scrollTrigger: trigger === "scroll" ? { trigger: ref.current, start: "top 88%", once: true } : undefined,
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
