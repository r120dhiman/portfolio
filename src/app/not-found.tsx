import Link from "next/link";
import { Magnetic } from "@/components/fx/Magnetic";

export default function NotFound() {
  return (
    <section className="gutter flex min-h-[85dvh] flex-col justify-center pb-16 pt-32">
      <p className="t-label">
        <span className="text-accent">GET</span> {"{this route}"} → <span className="text-accent">404</span> · Not Found
      </p>
      <h1 className="t-display mt-6">
        4<span className="t-serif text-accent">0</span>4
      </h1>
      <p className="mt-8 max-w-[34ch] text-[clamp(1.4rem,2.4vw,2.2rem)] leading-[1.2] tracking-[-0.02em]">
        This route returned 404 — <span className="t-serif">unlike my services,</span> which re-queue and resume.
      </p>
      <pre className="mt-10 max-w-full overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap text-muted sm:p-5 sm:text-[0.8rem]">
{`retry   1/3  → 404
retry   2/3  → 404
retry   3/3  → 404
status       → parked. redirecting you home instead.`}
      </pre>
      <div className="mt-12">
        <Magnetic>
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-medium text-[#0b0b0a] transition-transform hover:scale-[1.03]"
          >
            Take me home <span aria-hidden>→</span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
