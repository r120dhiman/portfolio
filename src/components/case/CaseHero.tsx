import { ViewTransition } from "react";
import Link from "next/link";
import { ProjectCover } from "@/components/fx/ProjectCover";
import { RevealText } from "@/components/fx/RevealText";
import type { Project } from "@/content/projects";
import type { CaseStudy } from "@/content/case-studies";

export function CaseHero({ project, study }: { project: Project; study: CaseStudy }) {
  const meta: { label: string; value: React.ReactNode }[] = [
    { label: "Role", value: project.role },
    { label: "Team", value: study.team },
    { label: "Period", value: project.period },
    { label: "Stack", value: project.stack.join(" · ") },
    ...(project.repo
      ? [
          {
            label: "Source",
            value: (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-sm underline decoration-accent decoration-1 underline-offset-4 outline-none transition-colors hover:text-accent focus-visible:text-accent"
              >
                {project.repo.replace(/^https?:\/\/(www\.)?github\.com\//, "")} <span aria-hidden>↗</span>
              </a>
            ),
          },
        ]
      : []),
    {
      label: "Live",
      value: project.live ? (
        <a
          href={project.live}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline decoration-accent decoration-1 underline-offset-4 transition-colors hover:text-accent"
        >
          {project.live.replace(/^https?:\/\/(www\.)?/, "")} <span aria-hidden>↗</span>
        </a>
      ) : (
        <span className="text-muted">Deploying soon</span>
      ),
    },
  ];

  return (
    <header className="gutter pt-32 md:pt-40">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/work"
          className="t-label rounded-sm transition-colors hover:text-fg focus-visible:text-fg focus-visible:underline focus-visible:underline-offset-4"
        >
          ← All work
        </Link>
        <span className="t-label">/</span>
        <span className="t-label">Case study</span>
        {project.team ? (
          <span className="rounded-full border border-accent/60 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-accent">
            Team project
          </span>
        ) : (
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted">
            Solo build
          </span>
        )}
      </div>

      <RevealText as="h1" by="chars" trigger="mount" className="t-display mt-8">
        {project.name}
      </RevealText>
      <RevealText as="p" trigger="mount" delay={0.25} className="mt-8 max-w-[34ch] text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.15] tracking-[-0.02em]">
        <span className="t-serif text-accent">{study.lede.split(" ").slice(0, 3).join(" ")}</span>{" "}
        {study.lede.split(" ").slice(3).join(" ")}
      </RevealText>

      <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-5">
        {meta.map((m) => (
          <div key={m.label} className={m.label === "Stack" ? "lg:col-span-1" : undefined}>
            <dt className="t-label mb-2">{m.label}</dt>
            <dd className="text-[0.95rem] leading-relaxed">{m.value}</dd>
          </div>
        ))}
      </dl>

      <ViewTransition name={`cover-${project.slug}`} share="morph" default="none">
        <div className="relative mt-14 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line md:aspect-[16/9]">
          <ProjectCover project={project} />
        </div>
      </ViewTransition>
    </header>
  );
}
