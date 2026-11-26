"use client";

import { useRef } from "react";
import Link from "next/link";
import { ViewTransition } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { featured } from "@/content/projects";
import { ProjectCover } from "@/components/fx/ProjectCover";
import { indexLabel, StackLine, TagChips, TeamBadge } from "./ProjectMeta";

/**
 * Mobile / touch / reduced-motion: a vertical stack. Each card enters as a
 * light "exploded view" — cover outlines and meta rows float on separate Z
 * planes, then snap together (CSS 3D only, no WebGL). Reduced motion: static.
 *
 * Z depth per plane lives in `data-plane`, and the dashed ghost outlines in
 * `data-ghost`, so the markup stays declarative and GSAP just reads it.
 */
export function FeaturedStack() {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>("[data-card]", root.current).forEach((li) => {
        const inner = li.querySelector<HTMLElement>("[data-card-inner]");
        const planes = gsap.utils.toArray<HTMLElement>("[data-plane]", li);
        const ghosts = gsap.utils.toArray<HTMLElement>("[data-ghost]", li);

        const tl = gsap.timeline({
          scrollTrigger: { trigger: li, start: "top 88%", once: true },
          defaults: { ease: "expo.out" },
        });

        tl.fromTo(li, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0);

        if (inner) {
          // The whole card is tipped back like an isometric drawing, then settles flat.
          tl.fromTo(inner, { rotateX: 26, rotateZ: -3, y: 40 }, { rotateX: 0, rotateZ: 0, y: 0, duration: 1.3 }, 0);
        }

        planes.forEach((el) => {
          const z = Number(el.dataset.plane ?? 0);
          tl.fromTo(el, { z, autoAlpha: 0 }, { z: 0, autoAlpha: 1, duration: 1.1 }, 0.1);
        });

        ghosts.forEach((el) => {
          const z = Number(el.dataset.ghost ?? 0);
          tl.fromTo(el, { z, autoAlpha: 0.9 }, { z: 0, autoAlpha: 0, duration: 1.2 }, 0.1);
        });
      });
    },
    { scope: root }
  );

  return (
    <ol ref={root} className="gutter grid gap-16 overflow-x-clip md:grid-cols-2 md:gap-x-8 md:gap-y-20">
      {featured.map((p, i) => (
        <li key={p.slug} data-card className="[perspective:1100px]">
          <div data-card-inner style={{ transformStyle: "preserve-3d", transformOrigin: "50% 0%" }}>
            <Link
              href={`/work/${p.slug}`}
              data-cursor="view"
              data-cursor-label="View case"
              className="group block focus-visible:ring-1 focus-visible:ring-accent"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px]">
                    <ProjectCover project={p} sizes="(min-width: 768px) 80vw, 100vw" />
                  </div>
                </ViewTransition>
                {[56, 112].map((z, j) => (
                  <span
                    key={z}
                    aria-hidden
                    data-ghost={z}
                    className="pointer-events-none absolute inset-0 rounded-[3px] border border-dashed opacity-0"
                    style={{ borderColor: j === 0 ? "rgba(236,235,230,0.28)" : "rgba(255,90,31,0.55)" }}
                  >
                    {j === 1 && (
                      <span className="absolute -top-5 left-0 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg/45">
                        <span className="size-[5px] rounded-full bg-accent" />
                        UI layer
                      </span>
                    )}
                  </span>
                ))}
              </div>

              <div data-plane="70" className="mt-5 flex items-center justify-between gap-3">
                <span className="t-label !text-fg">{indexLabel(i)}</span>
                <div className="flex items-center gap-2">
                  {p.team && <TeamBadge />}
                  <span className="t-label">{p.period}</span>
                </div>
              </div>
              <div data-plane="110">
                <h3 className="t-h2 mt-3">{p.name}</h3>
                <p className="mt-3 max-w-[44ch] text-base leading-snug text-fg/75">{p.oneLiner}</p>
              </div>
              {p.metric && (
                <p data-plane="150" className="mt-3 font-mono text-sm uppercase tracking-[0.06em] text-accent">
                  {p.metric}
                </p>
              )}
              <div data-plane="90">
                <TagChips tags={p.tags} className="mt-4" />
                <p className="mt-4 text-sm leading-snug text-fg/60">{p.role}</p>
              </div>
              <div data-plane="50">
                <StackLine stack={p.stack} className="mt-2" />
                <span className="t-label mt-5 inline-flex items-center gap-2 !text-fg">
                  Case study <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </div>
        </li>
      ))}
    </ol>
  );
}
