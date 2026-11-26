"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import clsx from "clsx";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import {
  education,
  experienceEntries,
  header,
  leadershipEntries,
  host,
  isVariant,
  order,
  projectEntries,
  skills,
  summary,
  variants,
  type ResumeEntry,
  type Variant,
} from "./data";

/** One-page LaTeX resumes, compiled by `npm run resume` (resume/*.tex → public/cv/). */
const pdfFor: Record<Variant, string> = {
  sde: "/cv/Rohit_Kumar_SDE.pdf",
  ai: "/cv/Rohit_Kumar_Frontier.pdf",
  fde: "/cv/Rohit_Kumar_FDE.pdf",
};

/** Reads ?v= from the URL. Must be rendered inside <Suspense>. */
export function ResumeFromParams() {
  const params = useSearchParams();
  const v = params.get("v");
  return <Resume initial={isVariant(v) ? v : "sde"} />;
}

export function Resume({ initial = "sde" }: { initial?: Variant }) {
  const [variant, setVariant] = useState<Variant>(initial);
  const root = useRef<HTMLDivElement>(null);
  const tabBar = useRef<HTMLDivElement>(null);
  const underline = useRef<HTMLSpanElement>(null);
  const mounted = useRef(false);

  /**
   * Move the accent underline to the selected variant, and crossfade the parts of the sheet
   * that actually change. Replaces framer-motion's `layoutId` + `AnimatePresence` with the
   * GSAP already used everywhere else on the site.
   */
  useGSAP(
    () => {
      const bar = tabBar.current;
      const line = underline.current;

      const place = (animate: boolean) => {
        if (!bar || !line) return;
        const btn = bar.querySelector<HTMLElement>('[data-variant-btn][aria-pressed="true"]');
        if (!btn) return;
        const b = bar.getBoundingClientRect();
        const r = btn.getBoundingClientRect();
        const to = { x: r.left - b.left, y: r.bottom - b.top - 2, width: r.width };
        if (animate) gsap.to(line, { ...to, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
        else gsap.set(line, { ...to, autoAlpha: 1 });
      };

      place(mounted.current && !prefersReducedMotion());

      // Measured rects go stale on reflow — re-place without animating when the bar resizes.
      const ro = bar ? new ResizeObserver(() => place(false)) : null;
      if (bar && ro) ro.observe(bar);

      if (mounted.current && !prefersReducedMotion()) {
        const changing = root.current?.querySelectorAll(".rs-headline, .rs-summary, .rs-bullets");
        if (changing?.length) {
          gsap.fromTo(
            changing,
            { autoAlpha: 0, y: 6 },
            { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.015, overwrite: true }
          );
        }
      }
      mounted.current = true;

      return () => ro?.disconnect();
    },
    { dependencies: [variant], scope: root }
  );

  const choose = (v: Variant) => {
    setVariant(v);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("v", v);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* non-browser */
    }
  };

  const o = order[variant];

  return (
    <div ref={root} className="resume-root">
      <PrintStyles />

      {/* Controls (screen only) */}
      <div className="mb-10 flex flex-col gap-6 print:hidden md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-label mb-3">Tailored for</p>
          <div
            ref={tabBar}
            role="group"
            aria-label="Resume variant"
            className="relative flex flex-wrap gap-x-7 gap-y-2"
          >
            <span
              ref={underline}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-[2px] bg-accent opacity-0"
            />
              {variants.map((v) => {
                const on = v.id === variant;
                return (
                  <button
                    key={v.id}
                    type="button"
                    data-variant-btn
                    aria-pressed={on}
                    onClick={() => choose(v.id)}
                    className={clsx(
                      "relative pb-2 text-[clamp(1.25rem,2.4vw,1.9rem)] font-medium tracking-[-0.03em] transition-colors duration-300",
                      on ? "text-fg" : "text-muted hover:text-fg"
                    )}
                  >
                    {v.label}
                  </button>
                );
              })}
          </div>
        </div>
        <a
          href={pdfFor[variant]}
          download
          data-cursor-label="PDF ↓"
          className="inline-flex items-center gap-3 self-start rounded-full bg-accent px-6 py-3 font-medium text-[#0b0b0a] transition-transform hover:scale-[1.03] md:self-auto"
        >
          Download PDF <span aria-hidden>↓</span>
        </a>
      </div>

      {/* The sheet */}
      <div id="resume-sheet" className="rs-sheet rounded-2xl border border-line bg-bg-2 p-6 sm:p-10 md:p-14">
        <header className="rs-head flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="rs-name text-[clamp(2.6rem,7vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.045em]">
              {header.name}
              <span className="text-accent">.</span>
            </h1>
            <p className="rs-headline t-serif mt-3 text-[clamp(1.2rem,2.2vw,1.7rem)] text-fg/85">
              {header.headline[variant]}
            </p>
          </div>
          <ul className="rs-contact space-y-1 font-mono text-[0.78rem] text-muted md:text-right">
            {header.contact.map((c) => (
              <li key={c.href}>
                <a href={c.href} className="transition-colors hover:text-accent">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <p className="rs-summary mt-8 max-w-[75ch] text-[1.02rem] leading-[1.7] text-fg/85">{summary[variant]}</p>

          <Block title="Internships">
            {o.experience.map((id) => (
              <Entry key={id} entry={experienceEntries[id]} variant={variant} />
            ))}
          </Block>

          <Block title="Projects">
            {o.projects.map((id) => (
              <Entry key={id} entry={projectEntries[id]} variant={variant} compact />
            ))}
          </Block>

          <Block title="Positions of responsibility">
            {o.leadership.map((id) => (
              <Entry key={id} entry={leadershipEntries[id]} variant={variant} compact />
            ))}
          </Block>

        <div className="rs-foot mt-10 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section>
            <h2 className="rs-h2 t-label mb-4 !text-accent">Skills</h2>
            <dl className="space-y-2">
              {skills[variant].map((s) => (
                <div key={s.group} className="grid grid-cols-[6.5rem_1fr] gap-3 text-[0.95rem] leading-[1.55]">
                  <dt className="rs-dt font-mono text-[0.75rem] uppercase tracking-[0.06em] text-muted">{s.group}</dt>
                  <dd>{s.items}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h2 className="rs-h2 t-label mb-4 !text-accent">Education</h2>
            <p className="font-medium">{education.school}</p>
            <p className="text-[0.95rem] text-fg/80">{education.degree}</p>
            <p className="rs-meta font-mono text-[0.78rem] text-muted">
              {education.years} · CPI {education.cpi}
            </p>
            <p className="mt-3 font-medium">{education.schooling.school}</p>
            {education.schooling.results.map((r) => (
              <p key={r.level} className="rs-meta font-mono text-[0.78rem] text-muted">
                {r.level} · {r.score}
                {r.detail ? ` · ${r.detail}` : ""}
              </p>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rs-block mt-10">
      <h2 className="rs-h2 t-label mb-5 !text-accent">{title}</h2>
      <ol className="space-y-7">{children}</ol>
    </section>
  );
}

function Entry({ entry, variant, compact }: { entry: ResumeEntry; variant: Variant; compact?: boolean }) {
  return (
    <li className="rs-entry">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[1.15rem] font-medium tracking-[-0.015em]">
          {entry.org}
          <span className="font-normal text-muted"> — {entry.title}</span>
          {entry.link && (
            <a href={entry.link} className="rs-link ml-2 font-mono text-[0.72rem] text-accent hover:underline">
              {host(entry.link)}
            </a>
          )}
        </h3>
        <span className="rs-meta font-mono text-[0.75rem] text-muted">{entry.period}</span>
      </div>
      {entry.note && <p className="rs-note mt-1 font-mono text-[0.72rem] text-muted">{entry.note}</p>}
        <ul className={clsx("rs-bullets mt-3 space-y-1.5", compact && "mt-2")}>
          {entry.bullets[variant].map((b) => (
            <li key={b} className="relative max-w-[90ch] pl-4 text-[0.97rem] leading-[1.6] text-fg/80">
              <span className="absolute left-0 top-[0.7em] h-1 w-1 rounded-full bg-accent" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
    </li>
  );
}

/** Print: one white A4 page, black text, nothing but the sheet. */
function PrintStyles() {
  return (
    <style>{`
@media print {
  @page { size: A4; margin: 10mm 12mm; }
  html, body { background: #fff !important; color: #000 !important; }
  body > *:not(main) { display: none !important; }
  main > *:not(:has(#resume-sheet)) { display: none !important; }
  .resume-page { padding: 0 !important; margin: 0 !important; }
  .grain { display: none !important; }
  #resume-sheet {
    border: 0 !important; border-radius: 0 !important; padding: 0 !important;
    background: #fff !important; color: #000 !important;
    font-size: 8.6pt; line-height: 1.38;
  }
  #resume-sheet * { color: #000 !important; background: transparent !important; box-shadow: none !important; transform: none !important; opacity: 1 !important; }
  #resume-sheet .rs-name { font-size: 24pt !important; line-height: 1 !important; }
  #resume-sheet .rs-name span { color: #000 !important; }
  #resume-sheet .rs-headline { font-size: 11pt !important; margin-top: 2pt !important; }
  #resume-sheet .rs-head { padding-bottom: 6pt !important; gap: 0 !important; border-color: #000 !important; flex-direction: row !important; align-items: flex-end !important; justify-content: space-between !important; display: flex !important; }
  #resume-sheet .rs-contact { font-size: 7.6pt !important; text-align: right !important; }
  #resume-sheet .rs-contact li { margin: 0 !important; }
  #resume-sheet .rs-summary { font-size: 8.8pt !important; line-height: 1.4 !important; margin-top: 7pt !important; max-width: none !important; }
  #resume-sheet .rs-block { margin-top: 9pt !important; }
  #resume-sheet .rs-h2 { font-size: 7.6pt !important; margin-bottom: 4pt !important; border-bottom: 0.6pt solid #000; padding-bottom: 1.5pt; letter-spacing: 0.12em; }
  #resume-sheet ol { gap: 0 !important; }
  #resume-sheet ol > * + * { margin-top: 6pt !important; }
  #resume-sheet h3 { font-size: 9.4pt !important; }
  #resume-sheet .rs-meta, #resume-sheet .rs-note, #resume-sheet .rs-link { font-size: 7.4pt !important; }
  #resume-sheet .rs-note { margin-top: 0 !important; }
  #resume-sheet .rs-bullets { margin-top: 2pt !important; }
  #resume-sheet .rs-bullets > * + * { margin-top: 1pt !important; }
  #resume-sheet .rs-bullets li { font-size: 8.5pt !important; line-height: 1.36 !important; max-width: none !important; padding-left: 9pt !important; }
  #resume-sheet .rs-bullets li > span { background: #000 !important; top: 0.62em !important; }
  #resume-sheet .rs-foot { margin-top: 9pt !important; gap: 14pt !important; grid-template-columns: 2fr 1fr !important; display: grid !important; }
  #resume-sheet .rs-foot dl > * + * { margin-top: 1pt !important; }
  #resume-sheet .rs-foot dl > div { font-size: 8.4pt !important; grid-template-columns: 5.2rem 1fr !important; line-height: 1.35 !important; }
  #resume-sheet .rs-dt { font-size: 7.2pt !important; }
  #resume-sheet .rs-foot p { font-size: 8.6pt !important; }
  #resume-sheet a { text-decoration: none !important; }
  #resume-sheet .rs-entry { break-inside: avoid; }
}
`}</style>
  );
}
