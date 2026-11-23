"use client";

import { RevealText } from "@/components/fx/RevealText";
import { FeaturedWheel } from "@/components/work/FeaturedWheel";
import { FeaturedStack } from "@/components/work/FeaturedStack";
import { CINEMATIC_QUERY, useMediaQuery } from "@/components/work/useMediaQuery";

/**
 * The centrepiece: 4 featured projects. Exactly one layout renders at a time so
 * each `cover-{slug}` ViewTransition name stays unique on the page.
 */
export function FeaturedWork() {
  const cinematic = useMediaQuery(CINEMATIC_QUERY);

  return (
    <section id="work" aria-label="Selected work" className="relative py-[clamp(6rem,14vh,10rem)]">
      <header className="gutter mb-[clamp(3rem,8vh,6rem)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-label mb-5">Selected work 2024–2026</p>
          <RevealText as="h2" className="t-h1 max-w-[14ch]">
            Products I&apos;ve <span className="t-serif text-accent">shipped</span>, end to end.
          </RevealText>
        </div>
        <p className="max-w-[36ch] text-sm leading-relaxed text-muted md:text-right">
          Agent backends, realtime LLM pipelines and the product around them.
        </p>
      </header>

      {cinematic ? <FeaturedWheel /> : <FeaturedStack />}
    </section>
  );
}
