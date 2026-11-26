"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Magnetic } from "@/components/fx/Magnetic";

/**
 * Route error boundary. Keeps the 404's voice rather than dropping to Next's default page.
 * `digest` is the only detail safe to surface — the message may contain internals in prod.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="gutter flex min-h-[85dvh] flex-col justify-center pb-16 pt-32">
      <p className="t-label">
        <span className="text-accent">render</span> {"{this route}"} → <span className="text-accent">500</span> · Unhandled
      </p>
      <h1 className="t-display mt-6">
        5<span className="t-serif text-accent">0</span>0
      </h1>
      <p className="mt-8 max-w-[38ch] text-[clamp(1.4rem,2.4vw,2.2rem)] leading-[1.2] tracking-[-0.02em]">
        Something threw on the way to rendering this. <span className="t-serif">Retrying is cheap</span> — the rest of the site is fine.
      </p>
      <pre className="mt-10 max-w-full overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap text-muted sm:p-5 sm:text-[0.8rem]">
{`boundary     → app/error.tsx
digest       → ${error.digest ?? "not reported"}
recoverable  → yes, this route re-renders on retry`}
      </pre>
      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Magnetic>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-medium text-[#0b0b0a] outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Try again <span aria-hidden>↻</span>
          </button>
        </Magnetic>
        <Link
          href="/"
          className="t-label rounded-sm outline-none transition-colors hover:text-fg focus-visible:text-fg focus-visible:underline focus-visible:underline-offset-4"
        >
          or go home →
        </Link>
      </div>
    </section>
  );
}
