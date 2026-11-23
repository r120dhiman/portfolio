"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { motion, MotionConfig, useReducedMotion, type Variants } from "motion/react";
import { featured } from "@/content/projects";
import { ProjectCover } from "@/components/fx/ProjectCover";
import { indexLabel, StackLine, TagChips, TeamBadge } from "./ProjectMeta";

const ease = [0.16, 1, 0.3, 1] as const;

/** Whole card: tipped back like an isometric drawing, then settles flat. */
const card: Variants = {
  exploded: { rotateX: 26, rotateZ: -3, y: 40 },
  assembled: {
    rotateX: 0,
    rotateZ: 0,
    y: 0,
    transition: { duration: 1.3, ease, delayChildren: 0.1, staggerChildren: 0.06 },
  },
};

/** Opacity lives on the perspective root: opacity on a preserve-3d node would flatten it. */
const item: Variants = {
  exploded: { opacity: 0 },
  assembled: { opacity: 1, transition: { duration: 0.7, ease } },
};

/** A plane that starts lifted off the card by `z` and drops into place. */
const plane = (z: number): Variants => ({
  exploded: { z, opacity: 0 },
  assembled: { z: 0, opacity: 1, transition: { duration: 1.1, ease } },
});

/** Ghost outline of the cover that collapses down onto it. */
const ghost = (z: number): Variants => ({
  exploded: { z, opacity: 0.9 },
  assembled: { z: 0, opacity: 0, transition: { duration: 1.2, ease } },
});

/**
 * Mobile / touch / reduced-motion: a vertical stack. Each card enters as a
 * light "exploded view" — cover outlines and meta rows float on separate Z
 * planes, then snap together (CSS 3D only, no WebGL). Reduced motion: static.
 */
export function FeaturedStack() {
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <ol className="gutter grid gap-16 overflow-x-clip md:grid-cols-2 md:gap-x-8 md:gap-y-20">
        {featured.map((p, i) => (
          <motion.li
            key={p.slug}
            variants={item}
            initial={reduce ? false : "exploded"}
            whileInView="assembled"
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            className="[perspective:1100px]"
          >
            <motion.div variants={card} style={{ transformStyle: "preserve-3d", transformOrigin: "50% 0%" }}>
              <Link
                href={`/work/${p.slug}`}
                data-cursor="view"
                data-cursor-label="View case"
                className="group block outline-none focus-visible:ring-1 focus-visible:ring-accent"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                  <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px]">
                      <ProjectCover project={p} />
                    </div>
                  </ViewTransition>
                  {!reduce &&
                    [56, 112].map((z, j) => (
                      <motion.span
                        key={z}
                        aria-hidden
                        variants={ghost(z)}
                        className="pointer-events-none absolute inset-0 rounded-[3px] border border-dashed"
                        style={{ borderColor: j === 0 ? "rgba(236,235,230,0.28)" : "rgba(255,90,31,0.55)" }}
                      >
                        {j === 1 && (
                          <span className="absolute -top-5 left-0 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg/45">
                            <span className="size-[5px] rounded-full bg-accent" />
                            UI layer
                          </span>
                        )}
                      </motion.span>
                    ))}
                </div>

                <motion.div variants={plane(70)} className="mt-5 flex items-center justify-between gap-3">
                  <span className="t-label !text-fg">{indexLabel(i)}</span>
                  <div className="flex items-center gap-2">
                    {p.team && <TeamBadge />}
                    <span className="t-label">{p.period}</span>
                  </div>
                </motion.div>
                <motion.div variants={plane(110)}>
                  <h3 className="t-h2 mt-3">{p.name}</h3>
                  <p className="mt-3 max-w-[44ch] text-base leading-snug text-fg/75">{p.oneLiner}</p>
                </motion.div>
                {p.metric && (
                  <motion.p
                    variants={plane(150)}
                    className="mt-3 font-mono text-sm uppercase tracking-[0.06em] text-accent"
                  >
                    {p.metric}
                  </motion.p>
                )}
                <motion.div variants={plane(90)}>
                  <TagChips tags={p.tags} className="mt-4" />
                  <p className="mt-4 text-sm leading-snug text-fg/60">{p.role}</p>
                </motion.div>
                <motion.div variants={plane(50)}>
                  <StackLine stack={p.stack} className="mt-2" />
                  <span className="t-label mt-5 inline-flex items-center gap-2 !text-fg">
                    Case study <span aria-hidden>→</span>
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          </motion.li>
        ))}
      </ol>
    </MotionConfig>
  );
}
