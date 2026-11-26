# rohitkumar.info

Personal site and case-study portfolio for Rohit Kumar — software engineer, AI products end to end.

Live at **[rohitkumar.info](https://rohitkumar.info)**.

Built with Next.js 16 (App Router, Turbopack, Cache Components), React 19, Tailwind 4, GSAP, Lenis and raw WebGL via [ogl](https://github.com/oframe/ogl).

---

## Why it's built this way

**All content lives in `src/content/`, never in components.** Every project, case study, resume
bullet and build log is typed data in one of four files. Components render it; they never hold
copy. That means a fact exists in exactly one place and the type system catches a project
referenced by a slug that no longer exists.

| File | Holds |
| --- | --- |
| `src/content/site.ts` | Identity, links, the proof-strip numbers, nav |
| `src/content/projects.ts` | Every project, the experience timeline, client work, skills |
| `src/content/case-studies.ts` | Long-form case studies + their hand-authored architecture diagrams |
| `src/content/lab.ts` | Work in progress, skills in development, build-log posts |

Two rules are enforced by convention and stated at the top of those files: **no invented
metrics** — a number that isn't verified doesn't ship — and **no "founder"/"co-founder"** wording
anywhere.

**Diagrams are data, not images.** `case-studies.ts` and `lab.ts` describe architecture as nodes,
edges and zones on a 1000×600 grid; `ArchitectureDiagram.tsx` renders that to inline SVG and draws
it in on scroll via `stroke-dashoffset`. Nothing to re-export when a service is renamed, and it
stays crisp and theme-aware at any size.

**One layout renders at a time.** `FeaturedWork` picks between a pinned, WebGL-driven
`FeaturedWheel` (desktop, fine pointer, motion allowed) and a simpler `FeaturedStack` everywhere
else, so each `cover-{slug}` view-transition name stays unique on the page.

**Motion degrades, it doesn't just switch off.** `prefers-reduced-motion` is checked in JS at every
GSAP call site (CSS `animation-duration: 0` can't touch GSAP's inline styles), WebGL scenes pause
when offscreen or when the tab is hidden, and both GL contexts are explicitly released on teardown.

## Layout

```
src/
  app/              routes — /, /work, /work/[slug], /blog, /blog/[slug], /resume
  content/          all copy and data (see above)
  components/
    hero/ home/     homepage sections
    work/ case/     featured-work layouts, case-study template
    blog/           build-log post template
    fx/             motion + WebGL primitives (cursor, preloader, shader field, reveals)
    tech/           the HUD layer: scroll rail, viewfinder, scramble text
    footer/ layout/ chrome
    seo/            structured data
resume/             LaTeX sources for the downloadable CVs
tests/              route smoke tests (node:test, no framework)
```

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Node **26** (see `engines`). CI runs the same version.

```bash
npm run build        # production build
npm run lint         # eslint
npm test             # route smoke tests — needs a build first
```

`npm test` boots `next start` on port 3100 and asserts every route returns 200 with exactly one
`<h1>`, that unknown routes return a real 404 rather than a soft 200, that canonicals and JSON-LD
are present, that the sitemap lists every page, and that all three CV PDFs download.

## The resume pipeline

The three downloadable CVs are **not** generated from the web resume — they're real LaTeX, in the
IIT (BHU) institute format, built to `public/cv/`:

```bash
npm run resume       # resume/build.py → tectonic → public/cv/*.pdf
```

Requires [tectonic](https://tectonic-typesetting.github.io/). `resume/rkresume.sty` carries the
stretch-glue layout so content fills to the footer, and the build **fails** on more than one page
or on an overfull line — overflow gets fixed by tightening wording, never by shrinking type.

`src/components/resume/data.ts` drives the HTML `/resume` page and its three variants (SDE-1,
Frontier/AI, Forward Deployed) independently of the LaTeX sources.

## Deployment

Static-first: everything prerenders at build time except the two case studies that stream, and the
OG images are generated per project at build. Deploys on Vercel from `main`.
