import Link from "next/link";
import { RevealText } from "@/components/fx/RevealText";
import { ArchitectureDiagram } from "@/components/case/ArchitectureDiagram";
import { CaseNav } from "@/components/case/CaseNav";
import { PostBreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import type { LabProject, PostBlock } from "@/content/lab";

const ARTICLE_ID = "post-body";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Stable anchor id for a heading, so the sidebar can link to it. */
const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Block({ block, project }: { block: PostBlock; project: LabProject }) {
  switch (block.kind) {
    case "h":
      return (
        <h2
          id={headingId(block.text)}
          className="mt-16 scroll-mt-28 text-[clamp(1.4rem,2.4vw,2rem)] font-medium leading-tight tracking-[-0.03em] text-fg"
        >
          {block.text}
        </h2>
      );
    case "p":
      return <p className="mt-6 text-[1.05rem] leading-[1.75] text-fg/80 md:text-[1.15rem]">{block.text}</p>;
    case "list":
      return (
        <ul className="mt-7 grid gap-3">
          {block.items.map((item) => (
            <li key={item} className="grid grid-cols-[1.25rem_1fr] gap-3 text-[1rem] leading-[1.7] text-fg/75 md:text-[1.08rem]">
              <span aria-hidden className="mt-[0.55em] h-px bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre className="mt-7 overflow-x-auto rounded-xl border border-line bg-bg-2 p-5 font-mono text-[0.82rem] leading-relaxed text-fg/85">
          <code>{block.text}</code>
        </pre>
      );
    case "diagram":
      return project.post.diagram ? <ArchitectureDiagram diagram={project.post.diagram} title={project.name} /> : null;
  }
}

export function PostView({ project, next }: { project: LabProject; next: LabProject | null }) {
  const { post } = project;
  const joinSubject = `Joining: ${project.name}`;

  const sections = post.blocks
    .filter((b): b is Extract<PostBlock, { kind: "h" }> => b.kind === "h")
    .map((b) => ({ id: headingId(b.text), label: b.text }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: project.oneLiner,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: site.name, url: site.url },
    publisher: { "@type": "Person", name: site.name, url: site.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/blog/${project.slug}` },
    keywords: project.stack.join(", "),
  };

  return (
    <article className="gutter pb-24 pt-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PostBreadcrumbJsonLd slug={project.slug} title={post.title} />

      {/* Header — full width */}
      <header>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/blog"
            className="t-label outline-none transition-colors hover:text-fg focus-visible:text-fg focus-visible:underline focus-visible:underline-offset-4"
          >
            ← All posts
          </Link>
          <span
            className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.1em]"
            style={{ color: project.accent }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: project.accent }} aria-hidden />
            {project.stage}
          </span>
          <time dateTime={post.date} className="t-label">
            {fmt(post.date)}
          </time>
        </div>

        <RevealText
          as="h1"
          trigger="mount"
          className="mt-8 max-w-[24ch] text-[clamp(2.3rem,5.5vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.04em]"
        >
          {post.title}
        </RevealText>

        <p className="mt-8 max-w-[58ch] text-lg leading-relaxed text-muted md:text-xl">{project.oneLiner}</p>
      </header>

      {/* Body + sticky rail */}
      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] lg:gap-16">
        <div id={ARTICLE_ID} className="min-w-0 max-w-[68ch] border-t border-line pt-2">
          {post.blocks.map((block, i) => (
            <Block key={i} block={block} project={project} />
          ))}
        </div>

        {/* The right column: reading progress + contents, then the facts that don't belong in prose. */}
        <aside className="lg:order-last">
          <div className="sticky top-28 grid gap-10">
            <CaseNav sections={sections} articleId={ARTICLE_ID} />

            <dl className="hidden border-t border-line pt-5 lg:grid lg:gap-5">
              <div>
                <dt className="t-label">Stage</dt>
                <dd className="mt-1.5 text-sm text-fg">{project.stage}</dd>
              </div>
              <div>
                <dt className="t-label">Status</dt>
                <dd className="mt-1.5 text-sm leading-snug text-fg">{project.status}</dd>
              </div>
              <div>
                <dt className="t-label">Started</dt>
                <dd className="mt-1.5 text-sm text-fg">{project.started}</dd>
              </div>
              <div>
                <dt className="t-label">Stack</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.06em] text-fg/70"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            {post.facts.length > 0 && (
              <dl className="hidden border-t border-line pt-5 lg:grid lg:gap-4">
                {post.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="t-label">{f.label}</dt>
                    <dd className="mt-1 text-lg tabular-nums text-fg">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="hidden border-t border-line pt-5 lg:block">
              <p className="t-label">Want in?</p>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(joinSubject)}`}
                data-cursor-label="Mail"
                className="group mt-3 inline-flex items-baseline gap-2 text-sm leading-snug text-fg outline-none transition-colors hover:text-accent focus-visible:text-accent focus-visible:underline focus-visible:underline-offset-4"
              >
                Mail me
                <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Meta row — mobile/tablet, where the rail is hidden */}
      <dl className="mt-16 grid gap-8 border-t border-line pt-6 sm:grid-cols-2 lg:hidden">
        <div>
          <dt className="t-label">Status</dt>
          <dd className="mt-2 text-fg">{project.status}</dd>
        </div>
        <div>
          <dt className="t-label">Stack</dt>
          <dd className="mt-2 text-fg/85">{project.stack.join(" · ")}</dd>
        </div>
      </dl>

      {/* Join CTA */}
      <aside className="mt-20 rounded-2xl border border-line bg-bg-2/60 p-8 md:mt-28 md:p-12">
        <p className="t-label">Want in on this one?</p>
        <p className="mt-5 max-w-[48ch] text-lg leading-snug tracking-[-0.02em] text-fg md:text-2xl">
          No form, no application. Mail me and say which part you&rsquo;d take.
        </p>

        <ul className="mt-8 grid gap-4 border-t border-line pt-6 md:grid-cols-3">
          {project.collab.map((c) => (
            <li key={c} className="text-[0.95rem] leading-relaxed text-fg/70">
              <span aria-hidden className="mb-3 block h-px w-8 bg-accent" />
              {c}
            </li>
          ))}
        </ul>

        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent(joinSubject)}`}
          data-cursor-label="Mail"
          className="group mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-[0.78rem] uppercase tracking-[0.1em] text-[var(--accent-ink)] outline-none transition-transform duration-500 ease-[var(--ease-out)] hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {site.email}
          <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1">
            →
          </span>
        </a>
      </aside>

      {next && (
        <div className="mt-20 border-t border-line pt-8">
          <p className="t-label">Next post</p>
          <Link
            href={`/blog/${next.slug}`}
            data-cursor-label="Read"
            className="group mt-4 inline-flex max-w-[40ch] items-baseline gap-4"
          >
            <span className="text-[clamp(1.4rem,2.6vw,2.2rem)] font-medium leading-tight tracking-[-0.03em] transition-colors duration-500 group-hover:text-accent group-focus-visible:text-accent">
              {next.post.title}
            </span>
            <span
              aria-hidden
              className="shrink-0 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1 group-focus-visible:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      )}
    </article>
  );
}
