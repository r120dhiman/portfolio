import { RevealText } from "@/components/fx/RevealText";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { CaseHero } from "./CaseHero";
import { CaseNav } from "./CaseNav";
import { NextProject } from "./NextProject";
import { caseSections, type CaseStudy } from "@/content/case-studies";
import type { Project } from "@/content/projects";

const prose = "max-w-[68ch] text-[1.075rem] leading-[1.75] text-fg/85";

function Section({ id, index, title, children }: { id: string; index: number; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line pt-12 pb-20 md:pt-16 md:pb-28">
      <p className="t-label mb-6">
        <span className="text-accent">{String(index).padStart(2, "0")}</span> — {caseSections[index - 1].label}
      </p>
      <RevealText as="h2" className="t-h2 mb-10 max-w-[18ch]">
        {title}
      </RevealText>
      {children}
    </section>
  );
}

export function CaseStudyView({ project, study, next }: { project: Project; study: CaseStudy; next: Project }) {
  const articleId = `case-${study.slug}`;
  return (
    <article>
      <CaseHero project={project} study={study} />

      <div className="gutter mt-20 grid grid-cols-1 gap-12 md:mt-28 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20">
        <aside className="lg:pt-16">
          <CaseNav sections={caseSections} articleId={articleId} />
        </aside>

        <div id={articleId}>
          <Section id="context" index={1} title={<>The <span className="t-serif">problem</span></>}>
            <div className="space-y-6">
              {study.context.map((p) => (
                <p key={p.slice(0, 24)} className={prose}>
                  {p}
                </p>
              ))}
            </div>
          </Section>

          <Section id="scope" index={2} title={<>What <span className="t-serif">I</span> built</>}>
            <p className={prose}>{study.scope.intro}</p>
            <ul className="mt-8 max-w-[68ch] divide-y divide-line border-y border-line">
              {study.scope.mine.map((m) => (
                <li key={m.slice(0, 24)} className="flex gap-4 py-5 text-[1.05rem] leading-[1.7]">
                  <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
            {study.scope.note && <p className="t-label mt-6 max-w-[68ch] !normal-case !tracking-normal">{study.scope.note}</p>}
          </Section>

          <Section id="architecture" index={3} title={<>How it <span className="t-serif">fits</span> together</>}>
            <p className={prose}>{study.architecture.intro}</p>
            <ArchitectureDiagram diagram={study.architecture.diagram} title={project.name} />
          </Section>

          <Section id="problems" index={4} title={<>Three <span className="t-serif">hard</span> problems</>}>
            <ol className="space-y-16">
              {study.problems.map((p, i) => (
                <li key={p.title} className="max-w-[68ch]">
                  <div className="mb-6 flex items-baseline gap-4">
                    <span className="font-mono text-sm text-accent">{String.fromCharCode(65 + i)}.</span>
                    <h3 className="text-[clamp(1.4rem,2.2vw,1.9rem)] font-medium leading-tight tracking-[-0.02em]">{p.title}</h3>
                  </div>
                  <dl className="space-y-6 border-l border-line pl-6">
                    <div>
                      <dt className="t-label mb-2">Problem</dt>
                      <dd className={prose}>{p.problem}</dd>
                    </div>
                    <div>
                      <dt className="t-label mb-2">Options</dt>
                      <dd>
                        <ul className="space-y-2">
                          {p.options.map((o) => (
                            <li key={o} className="flex gap-3 text-[1.02rem] leading-[1.7] text-fg/70">
                              <span className="font-mono text-muted" aria-hidden>
                                ~
                              </span>
                              {o}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[25px] top-0 h-full w-px bg-accent" aria-hidden />
                      <dt className="t-label mb-2 !text-accent">Choice</dt>
                      <dd className={prose}>{p.choice}</dd>
                    </div>
                    <div>
                      <dt className="t-label mb-2">Result</dt>
                      <dd className={`${prose} !text-fg`}>{p.result}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="ai" index={5} title={<>The <span className="t-serif">AI</span> part</>}>
            <p className={prose}>{study.ai.intro}</p>
            <div className="mt-10 grid max-w-[68rem] grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
              {study.ai.points.map((pt) => (
                <div key={pt.title} className="bg-bg p-6 md:p-8">
                  <h3 className="mb-3 text-lg font-medium tracking-[-0.01em]">{pt.title}</h3>
                  <p className="text-[0.98rem] leading-[1.7] text-fg/75">{pt.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="outcome" index={6} title={<>Where it <span className="t-serif">landed</span></>}>
            <div className="space-y-6">
              {study.outcome.map((p) => (
                <p key={p.slice(0, 24)} className={prose}>
                  {p}
                </p>
              ))}
            </div>
          </Section>

          <Section id="differently" index={7} title={<>What I&rsquo;d do <span className="t-serif">differently</span></>}>
            <ol className="max-w-[68ch] space-y-6">
              {study.differently.map((d, i) => (
                <li key={d.slice(0, 24)} className="grid grid-cols-[2.5rem_1fr] text-[1.05rem] leading-[1.75]">
                  <span className="font-mono text-sm leading-[1.9] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-fg/85">{d}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>

      <div className="gutter">
        <NextProject project={next} />
      </div>
    </article>
  );
}
