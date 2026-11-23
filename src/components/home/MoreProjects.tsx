"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { more, type Project, type RoleTag } from "@/content/projects";
import { RevealText } from "@/components/fx/RevealText";
import { ScrollTrigger } from "@/lib/gsap";
import { CursorPreview } from "@/components/work/CursorPreview";
import { hostOf, indexLabel, StackLine, TeamBadge, yearOf } from "@/components/work/ProjectMeta";
import { useMediaQuery } from "@/components/work/useMediaQuery";

type Filter = "All" | RoleTag;
const FILTERS: Filter[] = ["All", "AI", "Systems", "Shipped", "Customer"];
const ease = [0.16, 1, 0.3, 1] as const;

const countFor = (f: Filter) => (f === "All" ? more.length : more.filter((p) => p.tags.includes(f)).length);

export function MoreProjects() {
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState<string | null>(null);
  const canPreview = useMediaQuery("(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const list = filter === "All" ? more : more.filter((p) => p.tags.includes(filter));

  // The list height changes with the filter — let later ScrollTriggers re-measure.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 800);
    return () => clearTimeout(t);
  }, [filter]);

  return (
    <MotionConfig reducedMotion="user">
      <section id="projects" aria-label="More projects" className="gutter relative py-[clamp(6rem,14vh,10rem)]">
        <header className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-label mb-5">Index — more projects</p>
            <RevealText as="h2" className="t-h1">
              Other <span className="t-serif">things</span> I&apos;ve built.
            </RevealText>
          </div>

          <div role="group" aria-label="Filter projects by role" className="-mx-1 flex flex-wrap gap-1">
            {FILTERS.map((f) => {
              const on = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "relative rounded-full px-3.5 py-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] outline-none transition-colors duration-300 focus-visible:ring-1 focus-visible:ring-accent",
                    on ? "text-[#0b0b0a]" : "text-muted hover:text-fg"
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="more-projects-filter-pill"
                      className="absolute inset-0 rounded-full bg-fg"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
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

        <motion.ul layout className="group/list relative" onPointerLeave={() => setActive(null)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
                transition={{ duration: 0.7, ease }}
                onPointerEnter={() => setActive(p.slug)}
                className="transition-opacity duration-500 md:group-hover/list:opacity-35 md:hover:!opacity-100"
              >
                <Row project={p} index={more.indexOf(p)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {canPreview && <CursorPreview projects={more} active={active && list.some((p) => p.slug === active) ? active : null} />}
      </section>
    </MotionConfig>
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
    "group relative flex flex-col gap-3 border-b border-line py-6 outline-none md:grid md:grid-cols-12 md:items-center md:gap-6 md:py-7 focus-visible:bg-fg/[0.03]";

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
