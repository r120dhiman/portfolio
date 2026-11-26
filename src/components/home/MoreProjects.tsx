"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { more, type Project, type RoleTag } from "@/content/projects";
import { RevealText } from "@/components/fx/RevealText";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { CursorPreview } from "@/components/work/CursorPreview";
import { hostOf, indexLabel, StackLine, TeamBadge, yearOf } from "@/components/work/ProjectMeta";
import { useMediaQuery } from "@/components/work/useMediaQuery";

type Filter = "All" | RoleTag;
const FILTERS: Filter[] = ["All", "AI", "Systems", "Shipped", "Customer"];

const countFor = (f: Filter) => (f === "All" ? more.length : more.filter((p) => p.tags.includes(f)).length);

export function MoreProjects() {
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState<string | null>(null);
  const canPreview = useMediaQuery("(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const list = filter === "All" ? more : more.filter((p) => p.tags.includes(filter));

  const root = useRef<HTMLElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const filterBar = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mounted = useRef(false);

  // The list height changes with the filter — let later ScrollTriggers re-measure.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 800);
    return () => clearTimeout(t);
  }, [filter]);

  /**
   * Slide the active-filter pill to the selected button. This replaces framer-motion's
   * `layoutId`: we measure the button and move one shared element, which is the same idea
   * with none of the runtime. Offsets are relative to the bar, so wrapping rows work.
   */
  useGSAP(
    () => {
      const bar = filterBar.current;
      const el = pill.current;
      if (!bar || !el) return;

      const place = (animate: boolean) => {
        const btn = bar.querySelector<HTMLElement>('[data-filter-btn][aria-pressed="true"]');
        if (!btn) return;
        const b = bar.getBoundingClientRect();
        const r = btn.getBoundingClientRect();
        const to = { x: r.left - b.left, y: r.top - b.top, width: r.width, height: r.height };
        if (animate) gsap.to(el, { ...to, autoAlpha: 1, duration: 0.5, ease: "power3.out" });
        else gsap.set(el, { ...to, autoAlpha: 1 });
      };

      place(mounted.current && !prefersReducedMotion());

      // Positions come from measured rects, so any reflow (resize, or the bar wrapping to a
      // second row) strands the pill unless it is re-measured. Snap, never tween, on reflow.
      const ro = new ResizeObserver(() => place(false));
      ro.observe(bar);
      return () => ro.disconnect();
    },
    { dependencies: [filter], scope: root }
  );

  // Enter animation for the rows, but only when the filter actually changes.
  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (prefersReducedMotion()) return;
      const items = listRef.current?.querySelectorAll("[data-row-item]");
      if (!items?.length) return;
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.04, overwrite: true }
      );
    },
    { dependencies: [filter], scope: root }
  );

  return (
    <section ref={root} id="projects" aria-label="More projects" className="gutter relative py-[clamp(6rem,14vh,10rem)]">
      <header className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-label mb-5">Index — more projects</p>
          <RevealText as="h2" className="t-h1">
            Other <span className="t-serif">things</span> I&apos;ve built.
          </RevealText>
        </div>

        <div
          ref={filterBar}
          role="group"
          aria-label="Filter projects by role"
          className="relative -mx-1 flex flex-wrap gap-1"
        >
          <span
            ref={pill}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 rounded-full bg-fg opacity-0"
          />
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                type="button"
                data-filter-btn
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={clsx(
                  "relative rounded-full px-3.5 py-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-accent",
                  on ? "text-[#0b0b0a]" : "text-muted hover:text-fg"
                )}
              >
                <span className="relative">
                  {f}
                  <sup className="ml-1 text-[0.6rem] opacity-60">{countFor(f)}</sup>
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="hidden grid-cols-12 gap-6 border-b border-line pb-3 md:grid" aria-hidden>
        <span className="t-label col-span-1">No.</span>
        <span className="t-label col-span-3">Project</span>
        <span className="t-label col-span-4">What it is</span>
        <span className="t-label col-span-2">Stack</span>
        <span className="t-label col-span-1">Year</span>
        <span className="t-label col-span-1 text-right">Live</span>
      </div>

      <ul ref={listRef} className="group/list relative" onPointerLeave={() => setActive(null)}>
        {list.map((p) => (
          <li
            key={p.slug}
            data-row-item
            onPointerEnter={() => setActive(p.slug)}
            className="transition-opacity duration-500 md:group-hover/list:opacity-35 md:hover:!opacity-100"
          >
            <Row project={p} index={more.indexOf(p)} />
          </li>
        ))}
      </ul>

      {canPreview && <CursorPreview projects={more} active={active && list.some((p) => p.slug === active) ? active : null} />}
    </section>
  );
}

function Row({ project: p, index }: { project: Project; index: number }) {
  const body = (
    <>
      <span className="t-label hidden md:col-span-1 md:block">{indexLabel(index)}</span>

      <div className="flex items-baseline justify-between gap-4 md:col-span-3 md:block">
        <h3 className="text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium leading-none tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-out)] md:group-hover:translate-x-3">
          {p.name}
        </h3>
        <span className="t-label shrink-0 md:hidden">{yearOf(p)}</span>
      </div>

      <div className="md:col-span-4">
        <p className="text-[0.95rem] leading-snug text-fg/70 transition-[color,transform] duration-700 ease-[var(--ease-out)] md:group-hover:translate-x-1.5 md:group-hover:text-fg">
          {p.oneLiner}
        </p>
        {p.team && <TeamBadge className="mt-2.5" />}
      </div>

      <StackLine stack={p.stack} className="md:col-span-2" />

      <span className="t-label hidden md:col-span-1 md:block">{yearOf(p)}</span>

      <span className="md:col-span-1 md:text-right">
        {p.live ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-fg">
            <span className="md:sr-only">{hostOf(p.live)}</span>
            <span
              aria-hidden
              className="inline-block text-base transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            >
              ↗
            </span>
          </span>
        ) : (
          <span className="t-label">—</span>
        )}
      </span>

      {/* accent wipe */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-right scale-x-0 bg-accent transition-transform duration-700 ease-[var(--ease-out)] group-hover:origin-left group-hover:scale-x-100"
      />
    </>
  );

  const cls =
    "group relative flex flex-col gap-3 border-b border-line py-6 md:grid md:grid-cols-12 md:items-center md:gap-6 md:py-7";

  return p.live ? (
    <a
      href={p.live}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-label="Visit ↗"
      aria-label={`${p.name} — open live site (${hostOf(p.live)}) in a new tab`}
      className={cls}
    >
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}
