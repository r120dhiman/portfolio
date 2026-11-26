/** Case-study skeleton. Mirrors CaseHero's shape so the swap to real content doesn't jump. */
export default function Loading() {
  return (
    <div className="gutter pt-32 md:pt-40" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading case study…</span>

      <div className="flex flex-wrap items-center gap-3">
        <span className="t-label">← All work</span>
        <span className="t-label">/</span>
        <span className="t-label text-fg/40">Case study</span>
      </div>

      <div className="mt-10 h-[clamp(3rem,9vw,7rem)] w-[min(100%,22ch)] rounded-lg bg-fg/[0.06]" />
      <div className="mt-8 h-6 w-[min(100%,52ch)] rounded bg-fg/[0.04]" />
      <div className="mt-3 h-6 w-[min(100%,40ch)] rounded bg-fg/[0.04]" />

      <div className="mt-14 grid gap-8 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i}>
            <div className="h-3 w-16 rounded bg-fg/[0.06]" />
            <div className="mt-3 h-4 w-24 rounded bg-fg/[0.03]" />
          </div>
        ))}
      </div>

      <div className="mt-12 aspect-[16/10] w-full rounded-2xl border border-line bg-fg/[0.02]" />
    </div>
  );
}
