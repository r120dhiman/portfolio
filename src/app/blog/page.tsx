import { ViewTransition } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RevealText } from "@/components/fx/RevealText";
import { posts } from "@/content/lab";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Build logs from work in progress: a fine-tuned reply model running fully on-device, and going a layer down into kernel-level C.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog",
    description: "Build logs from work in progress — what works, what doesn't, and what I got wrong.",
    url: "/blog",
    type: "website",
  },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function BlogIndex() {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <section className="gutter pb-24 pt-32 md:pt-40">
      <p className="t-label">Build logs · {posts.length} posts</p>
      <RevealText as="h1" by="chars" trigger="mount" className="t-display mt-6">
        Blog
      </RevealText>
      <p className="mt-10 max-w-[56ch] text-lg leading-relaxed text-muted">
        Notes from things that aren&rsquo;t finished. I write these while building, so they say what&rsquo;s broken as well as what
        works — and they get updated rather than replaced.
      </p>

      <ul className="mt-16 grid gap-px md:mt-24">
        {posts.map((p, i) => (
          <li key={p.slug} className="relative border-t border-line">
            <Link
              href={`/blog/${p.slug}`}
              data-cursor-label="Read"
              className="group relative grid gap-4 py-10 md:grid-cols-12 md:items-baseline md:gap-6 md:py-12"
            >
              <div className="flex items-center gap-4 md:col-span-3 md:block">
                <span className="t-label tabular-nums text-fg/40">{String(i + 1).padStart(2, "0")}</span>
                <time dateTime={p.post.date} className="t-label md:mt-3 md:block">
                  {fmt(p.post.date)}
                </time>
              </div>

              <div className="md:col-span-7">
                <h2 className="max-w-[40ch] text-[clamp(1.5rem,2.8vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-out)] md:group-hover:translate-x-2">
                  {p.post.title}
                </h2>
                <p className="t-label mt-4">
                  <span style={{ color: p.accent }}>{p.stage}</span> · {p.name}
                </p>
              </div>

              <span className="md:col-span-2 md:text-right">
                <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-fg">
                  Read
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:text-accent"
                  >
                    →
                  </span>
                </span>
              </span>

              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-right scale-x-0 bg-accent transition-transform duration-700 ease-[var(--ease-out)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
              />
            </Link>
          </li>
        ))}
      </ul>
      </section>
    </ViewTransition>
  );
}
