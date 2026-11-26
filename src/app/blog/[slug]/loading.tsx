/** Build-log skeleton. Matches PostView's header + two-column body so the swap doesn't jump. */
export default function Loading() {
  return (
    <div className="gutter pt-32 md:pt-40" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading post…</span>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="t-label">← All posts</span>
        <span className="t-label text-fg/40">Loading</span>
      </div>

      <div className="mt-8 h-[clamp(2.3rem,5.5vw,4.75rem)] w-[min(100%,24ch)] rounded-lg bg-fg/[0.06]" />
      <div className="mt-8 h-5 w-[min(100%,50ch)] rounded bg-fg/[0.04]" />

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] lg:gap-16">
        <div className="max-w-[68ch] border-t border-line pt-8">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="mt-4 h-4 rounded bg-fg/[0.035]" style={{ width: `${92 - i * 7}%` }} />
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="h-3 w-24 rounded bg-fg/[0.06]" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="mt-4 h-3 w-full rounded bg-fg/[0.03]" />
          ))}
        </div>
      </div>
    </div>
  );
}
