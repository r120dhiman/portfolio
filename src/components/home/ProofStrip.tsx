"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Marquee } from "@/components/fx/Marquee";
import { site } from "@/content/site";
import { skills } from "@/content/projects";

const format = (n: number) => Math.round(n).toLocaleString("en-US");

/** Stack words for the marquee: a curated cut across every skill group. */
const stackWords = skills.flatMap((g) => g.items.slice(0, 3)).filter((w) => w.length <= 14);

export function ProofStrip() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const cells = gsap.utils.toArray<HTMLElement>("[data-proof]", root);
      cells.forEach((cell, i) => {
        const num = cell.querySelector<HTMLElement>("[data-num]");
        const target = Number(cell.dataset.value);
        if (!num || !Number.isFinite(target)) return;
        const counter = { v: 0 };
        num.textContent = format(0);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: cell, start: "top 88%", toggleActions: "play none none none" },
          delay: i * 0.08,
        });
        tl.from(cell.querySelectorAll("[data-fade]"), { y: 24, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0).to(
          counter,
          {
            v: target,
            duration: target < 20 ? 1.2 : 2.2,
            ease: "expo.out",
            onUpdate: () => {
              num.textContent = format(counter.v);
            },
          },
          0
        );
      });
      gsap.from("[data-proof-line]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.4,
        ease: "expo.inOut",
        scrollTrigger: { trigger: root, start: "top 90%", toggleActions: "play none none none" },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} aria-labelledby="proof-heading" className="relative pt-24 md:pt-36">
      <h2 id="proof-heading" className="sr-only">
        Proof in numbers
      </h2>

      <div className="gutter">
        <div data-proof-line className="h-px w-full bg-line" aria-hidden />
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {site.proof.map((p, i) => (
            <div
              key={p.label}
              data-proof
              data-value={p.value}
              className={[
                "flex flex-col justify-between gap-6 border-line py-8 md:py-12",
                i % 2 === 1 ? "border-l pl-4 md:pl-8" : "pr-4 md:pr-8",
                i >= 2 ? "border-t lg:border-t-0" : "",
                i === 2 ? "lg:border-l lg:pl-8" : "",
              ].join(" ")}
            >
              <dt data-fade className="t-label order-2 max-w-[18ch] normal-case! tracking-[0.01em]! md:text-sm!">
                {p.label}
              </dt>
              <dd className="order-1">
                <span className="sr-only">
                  {format(p.value)}
                  {p.suffix}
                </span>
                <span
                  aria-hidden
                  className="block whitespace-nowrap text-[clamp(2.4rem,8vw,7.5rem)] font-medium leading-[0.85] tracking-[-0.05em] tabular-nums"
                >
                  <span data-num>{format(p.value)}</span>
                  <span className="t-serif text-accent">{p.suffix}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <div data-proof-line className="h-px w-full bg-line" aria-hidden />
      </div>

      <div aria-hidden className="mt-16 select-none md:mt-24">
        <Marquee speed={50} className="py-2">
          {stackWords.map((word, i) => (
            <Fragment key={word}>
              <span
                className={
                  i % 2 === 0
                    ? "px-[0.25em] text-[clamp(3.5rem,11vw,10rem)] font-medium leading-[1] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1px_var(--fg)]"
                    : "t-serif px-[0.25em] text-[clamp(3.5rem,11vw,10rem)] leading-[1] text-fg"
                }
              >
                {word}
              </span>
              <span className="self-center px-[0.2em] text-[clamp(1.5rem,4vw,3.5rem)] leading-none text-accent">✳</span>
            </Fragment>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
