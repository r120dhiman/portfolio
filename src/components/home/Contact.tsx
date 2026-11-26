"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { RevealText } from "@/components/fx/RevealText";
import { Magnetic } from "@/components/fx/Magnetic";
import { SectionLabel } from "@/components/sections/SectionLabel";
import { RollText } from "@/components/sections/RollText";
import { site } from "@/content/site";

const socials = [
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
] as const;

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-contact-fade]", {
        y: 30,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-contact-email]", start: "top 90%", toggleActions: "play none none none" },
      });
    },
    { scope: ref }
  );

  const onEmail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !navigator.clipboard?.writeText) return; // fall back to mailto
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = site.links.email;
    }
  };

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-heading" className="gutter relative scroll-mt-20 pb-24 pt-28 md:pb-32 md:pt-40">
      <SectionLabel aside={site.domain}>Contact</SectionLabel>

      <RevealText as="h2" className="t-display mt-12 md:mt-16">
        <span id="contact-heading">
          Let&rsquo;s build <br />
          <span className="t-serif text-accent">something real.</span>
        </span>
      </RevealText>

      <div data-contact-email className="mt-16 md:mt-24">
        <p data-contact-fade className="t-label mb-4">
          Click to copy · or{" "}
          <a href={site.links.email} className="underline decoration-line underline-offset-4 outline-none hover:text-fg focus-visible:text-fg">
            open mail app
          </a>
        </p>
        <div data-contact-fade>
          <Magnetic strength={0.18}>
            <a
              href={site.links.email}
              onClick={onEmail}
              data-cursor-label="Copy"
              aria-label={`Copy email address ${site.email}`}
              className="group relative inline-block max-w-full break-all pb-2 text-[clamp(1.55rem,6.6vw,7.5rem)] font-medium leading-[1] tracking-[-0.045em]"
            >
              {site.email}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 bg-accent transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
              />
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="mt-16 grid gap-8 border-t border-line pt-6 md:mt-24 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <p data-contact-fade className="flex items-start gap-3 text-base text-fg/85 md:text-lg">
          <span className="relative mt-[0.45em] flex h-2 w-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span>{site.status}</span>
        </p>
        <ul data-contact-fade className="flex gap-8 font-mono text-sm uppercase tracking-[0.08em]">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="Open"
                aria-label={`${s.label} (opens in new tab)`}
                className="group inline-flex items-center gap-2 outline-none focus-visible:text-accent"
              >
                <RollText>{s.label}</RollText>
                <span aria-hidden className="text-accent">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-8 z-[70] flex justify-center">
        <AnimatePresence>
          {copied ? (
            <motion.div
              key="toast"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-full bg-fg px-5 py-3 font-mono text-xs uppercase tracking-[0.08em] text-bg"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              Copied — {site.email}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
