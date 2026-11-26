import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { ProjectCover } from "@/components/fx/ProjectCover";
import { RevealText } from "@/components/fx/RevealText";
import { caseStudies } from "@/content/case-studies";
import { featured } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies: realtime AI agents, travel planning at scale, exam tooling and a national sports-festival platform.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  const items = featured.filter((p) => caseStudies.some((c) => c.slug === p.slug));
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <section className="gutter pb-24 pt-32 md:pt-40">
      <p className="t-label">Selected work · {items.length} case studies</p>
      <RevealText as="h1" by="chars" trigger="mount" className="t-display mt-6">
        Work
      </RevealText>
      <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
        {items.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/work/${p.slug}`} className="group block">
              <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
                  <div className="h-full w-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]">
                    <ProjectCover project={p} />
                  </div>
                </div>
              </ViewTransition>
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-[clamp(1.6rem,3vw,2.6rem)] font-medium tracking-[-0.03em]">
                  <span className="mr-3 font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {p.name}
                </h2>
                <span className="t-label">{p.team ? "Team" : "Solo"} · {p.period}</span>
              </div>
              <p className="mt-2 max-w-[52ch] leading-relaxed text-muted">{p.oneLiner}</p>
            </Link>
          </li>
        ))}
      </ul>
      </section>
    </ViewTransition>
  );
}
