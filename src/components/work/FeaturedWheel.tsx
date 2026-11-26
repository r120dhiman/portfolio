"use client";

import Link from "next/link";
import { useEffect, useRef, ViewTransition, type CSSProperties } from "react";
import { featured } from "@/content/projects";
import { ProjectCover } from "@/components/fx/ProjectCover";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/fx/SmoothScroll";
import { indexLabel, StackLine, TagChips, TeamBadge } from "./ProjectMeta";
import { ExplodedLayer, P3, PAR_BASE, PAR_EXPLODED, REST, SPREAD } from "./ExplodedLayer";
import { chain, rotX, rotY, smoothstep, translate } from "./webgl/math";
import type { ShardStage } from "./webgl/ShardStage";

const PERSP = 1600;
/** Depth of the cover plane (shared by the DOM layer and the WebGL shards). */
const COVER_K = 0.3;
const ACCENT = "#ff5a1f";

type Box = { pcx: number; pcy: number; ccx: number; ccy: number; cx: number; cy: number; cw: number; ch: number };

/** Offset of `el` relative to `root`, ignoring transforms. */
const offsetIn = (el: HTMLElement, root: HTMLElement) => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
};

/**
 * Desktop: a pinned "exploded view" stage. Each project is an engineering
 * drawing — cover, index, name, output, role and stack sit on separate Z
 * planes joined by dashed depth connectors and mono callouts. Scroll assembles
 * the centred project, then blows it apart (the cover shatters into WebGL
 * shards) as the next one flies in and snaps together. The cursor tilts the
 * whole assembly and parallaxes the planes.
 */
export function FeaturedWheel() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    () => {
      const el = root.current;
      const tilt = el?.querySelector<HTMLElement>("[data-tilt]");
      if (!el || !tilt) return;
      const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-panel]"));
      const coverLayers = panels.map((p) => p.querySelector<HTMLElement>("[data-cover-layer]"));
      const coverDoms = panels.map((p) => p.querySelector<HTMLElement>("[data-cover-dom]"));
      const counter = el.querySelector<HTMLElement>("[data-counter]");
      const bar = el.querySelector<HTMLElement>("[data-bar]");
      const status = el.querySelector<HTMLElement>("[data-status]");
      const n = panels.length;

      let W = el.clientWidth;
      let H = el.clientHeight;
      let boxes: Box[] = [];
      let dirty = true;

      // ---- WebGL shards (optional) ----
      let stage: ShardStage | null = null;
      let disposed = false;
      const measure = () => {
        W = el.clientWidth;
        H = el.clientHeight;
        boxes = panels.map((panel, i) => {
          const po = offsetIn(panel, el);
          const cl = coverLayers[i];
          const co = cl ? offsetIn(cl, el) : po;
          const cw = cl?.offsetWidth ?? 1;
          const ch = cl?.offsetHeight ?? 1;
          return {
            pcx: po.x + panel.offsetWidth / 2,
            pcy: po.y + panel.offsetHeight / 2,
            ccx: co.x + cw / 2,
            ccy: co.y + ch / 2,
            cx: co.x,
            cy: co.y,
            cw,
            ch,
          };
        });
        const b = boxes[0];
        if (stage && b) stage.resize(W, H, b.cw, b.ch);
        dirty = true;
      };

      import("./webgl/ShardStage")
        .then(({ ShardStage }) => {
          if (disposed) return;
          try {
            const s = new ShardStage(
              featured.map((p) => ({
                image: p.image,
                accent: p.accent,
                name: p.name,
                label: p.stack.slice(0, 3).join(" · "),
              })),
              ACCENT
            );
            s.canvas.setAttribute("aria-hidden", "true");
            s.canvas.className = "pointer-events-none absolute inset-0 z-[1] h-full w-full";
            el.appendChild(s.canvas);
            stage = s;
            measure();
          } catch {
            stage = null; // no WebGL: the DOM covers explode on their own
          }
        })
        .catch(() => {});

      // ---- Scroll → progress ----
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${(n - 1) * window.innerHeight * 1.2}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: measure,
      });

      const targetP = () => {
        const s = st.scroll();
        const vh = window.innerHeight;
        if (s < st.start) return -0.55 * (1 - smoothstep(st.start - vh, st.start - vh * 0.1, s));
        if (s > st.end) return n - 1 + 0.5 * smoothstep(st.end + vh * 0.1, st.end + vh, s);
        const raw = ((s - st.start) / Math.max(1, st.end - st.start)) * (n - 1);
        const i = Math.min(n - 2, Math.floor(raw));
        // Hold each project assembled, then move briskly to the next.
        return i + smoothstep(0.2, 0.8, raw - i);
      };

      // ---- Pointer ----
      let tmx = 0;
      let tmy = 0;
      let th = 0;
      let mouseX = 0;
      let mouseY = 0;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
        tmx = (mouseX / r.width) * 2 - 1;
        tmy = (mouseY / r.height) * 2 - 1;
        th = 1;
      };
      const onLeave = () => {
        tmx = 0;
        tmy = 0;
        th = 0;
      };
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);

      // ---- Keyboard: focusing a panel scrolls to its assembled state ----
      const onFocus = (e: FocusEvent) => {
        el.scrollLeft = 0;
        el.scrollTop = 0;
        const i = panels.findIndex((p) => p.contains(e.target as Node));
        if (i < 0 || n < 2) return;
        const top = st.start + (i / (n - 1)) * (st.end - st.start);
        // Go through Lenis when present so its own momentum can't drag the page back.
        if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo({ top, behavior: "instant" });
      };
      el.addEventListener("focusin", onFocus);

      // ---- Frame loop ----
      let p = targetP();
      let mx = 0;
      let my = 0;
      let h = 0;
      let last = performance.now();
      let raf = 0;
      let glDrawn = false;
      let current = -1;
      let exploded: boolean | null = null;
      let prev = { p: NaN, mx: NaN, my: NaN, h: NaN };

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const tp = targetP();
        p += (tp - p) * (1 - Math.exp(-dt * 12));
        if (Math.abs(tp - p) < 1e-4) p = tp;
        const kk = 1 - Math.exp(-dt * 6);
        mx += (tmx - mx) * kk;
        my += (tmy - my) * kk;
        h += (th - h) * kk;

        const still =
          Math.abs(p - prev.p) < 1e-5 && Math.abs(mx - prev.mx) < 1e-4 && Math.abs(my - prev.my) < 1e-4 && Math.abs(h - prev.h) < 1e-4;
        if (still && !dirty) return;
        dirty = false;
        prev = { p, mx, my, h };

        const tiltX = -my * 4 * h;
        const tiltY = mx * 6 * h;
        el.style.setProperty("--mx", (mx * h).toFixed(4));
        el.style.setProperty("--my", (my * h).toFixed(4));
        el.style.setProperty("--h", h.toFixed(3));
        tilt.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        const tiltM = chain(translate(W / 2, H / 2), rotX(tiltX), rotY(tiltY), translate(-W / 2, -H / 2));

        const active = Math.round(Math.min(n - 1, Math.max(0, p)));
        const items: Parameters<ShardStage["render"]>[0] = [];
        let activeE = 0;

        panels.forEach((panel, i) => {
          const d = p - i;
          const a = Math.abs(d);
          const e = smoothstep(0.03, 0.42, a);
          const v = 1 - smoothstep(0.28, 0.56, a);
          if (i === active) activeE = e;
          const tx = -d * W * 0.3;
          const tz = -e * 380;
          const rx = e * 16;
          const ry = -Math.sign(d) * e * 22;
          panel.style.transform = `translate3d(${tx}px, 0px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          panel.style.setProperty("--e", e.toFixed(4));
          panel.style.setProperty("--v", v.toFixed(4));
          panel.style.pointerEvents = i === active && v > 0.5 ? "" : "none";

          const b = boxes[i];
          const useGL = !!stage && stage.isReady(i) && !!b && e > 0.002 && v > 0.001;
          const dom = coverDoms[i];
          if (dom) dom.style.visibility = useGL ? "hidden" : "";
          if (useGL && b) {
            const par = (PAR_BASE + PAR_EXPLODED * e) * COVER_K;
            const model = chain(
              tiltM,
              translate(b.pcx, b.pcy),
              translate(tx, 0, tz),
              rotX(rx),
              rotY(ry),
              translate(-b.pcx, -b.pcy),
              translate(b.ccx + mx * h * par, b.ccy + my * h * par, COVER_K * (e * SPREAD + REST))
            );
            items.push({ i, model, explode: e, dir: Math.sign(d) || 1, alpha: v });
          }
          if (i === active && b) {
            el.style.setProperty("--gx", `${((mouseX - b.cx) / b.cw) * 100}%`);
            el.style.setProperty("--gy", `${((mouseY - b.cy) / b.ch) * 100}%`);
          }
        });

        if (stage) {
          if (items.length) {
            stage.render(items, PERSP);
            glDrawn = true;
          } else if (glDrawn) {
            stage.clear();
            glDrawn = false;
          }
        }

        if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p / Math.max(1, n - 1)))})`;
        if (active !== current && counter) {
          current = active;
          counter.textContent = indexLabel(active);
        }
        const ex = activeE > 0.15;
        if (ex !== exploded && status) {
          exploded = ex;
          status.textContent = ex ? "Exploded view" : "Assembled";
          status.dataset.on = ex ? "1" : "0";
        }
      };

      // Run only while on screen and the tab is visible.
      let onScreen = false;
      const start = () => {
        if (raf || !onScreen || document.hidden) return;
        last = performance.now();
        dirty = true;
        raf = requestAnimationFrame(frame);
      };
      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
      };
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      });
      io.observe(el);
      const onVis = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVis);
      const ro = new ResizeObserver(() => measure());
      ro.observe(el);

      measure();

      return () => {
        disposed = true;
        stop();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("focusin", onFocus);
        stage?.destroy();
        stage = null;
      };
    },
    { scope: root }
  );

  const n = featured.length;

  return (
    <div ref={root} className="relative h-svh overflow-hidden" style={{ perspective: `${PERSP}px` }}>
      {/* Drafting grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
          backgroundSize: "calc(100vw / 24) calc(100vw / 24)",
          maskImage: "radial-gradient(70% 60% at 50% 50%, #000 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 50%, #000 0%, transparent 100%)",
        }}
      />

      <div data-tilt className="absolute inset-0 grid place-items-center" style={P3}>
        {featured.map((p, i) => (
          <article
            key={p.slug}
            data-panel
            className="relative h-[min(72svh,800px)] w-[76vw] [grid-area:1/1]"
            style={{ ...P3, "--e": 0, "--v": 1 } as CSSProperties}
          >
            <Link
              href={`/work/${p.slug}`}
              data-cursor="view"
              data-cursor-label="View case"
              aria-label={`${p.name} — case study`}
              className="group relative grid h-full grid-cols-12 gap-[2vw] p-[1.4vw] "
              style={P3}
            >
              {/* Base plate */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-md border border-line bg-bg-2/85 transition-colors duration-700 group-hover:border-fg/25 group-focus-visible:border-accent"
                style={{ opacity: "var(--v, 1)" }}
              >
                <span
                  className="absolute inset-0 rounded-md"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.045) 50%, transparent 65%)",
                    backgroundSize: "250% 100%",
                    backgroundPosition: "calc(50% - var(--mx, 0) * 60%) 0",
                    opacity: "var(--h, 0)",
                  }}
                />
                {/* Registration marks */}
                {["-left-3 -top-3", "-right-3 -top-3", "-left-3 -bottom-3", "-right-3 -bottom-3"].map((pos) => (
                  <span
                    key={pos}
                    className={`absolute size-6 ${pos}`}
                    style={{ opacity: "min(1, calc(var(--e, 0) * 2))" }}
                  >
                    <span className="absolute left-1/2 top-0 h-full w-px bg-fg/30" />
                    <span className="absolute left-0 top-1/2 h-px w-full bg-fg/30" />
                  </span>
                ))}
                <span
                  className="absolute -top-8 left-0 font-mono text-[10px] uppercase tracking-[0.14em] text-fg/40"
                  style={{ opacity: "min(1, calc(var(--e, 0) * 2))" }}
                >
                  Fig. {indexLabel(i)} — {p.name} <span className="text-fg/25">/ exploded view</span>
                </span>
              </span>

              <div className="relative col-span-7 h-full min-h-0" style={P3}>
                <ExplodedLayer k={COVER_K} label="UI layer" side="left" anchorY="14%" className="h-full" contentClassName="h-full" data-cover-layer>
                  <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
                    <div data-cover-dom className="relative h-full w-full overflow-hidden rounded-[3px]">
                      <div className="h-full w-full transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]">
                        <ProjectCover project={p} />
                      </div>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(45% 55% at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.16), transparent 70%)",
                          opacity: "calc(var(--h, 0) * (1 - var(--e, 0)))",
                          mixBlendMode: "soft-light",
                        }}
                      />
                    </div>
                  </ViewTransition>
                </ExplodedLayer>
              </div>

              <div className="col-span-5 flex min-h-0 flex-col justify-between py-[0.4vw]" style={P3}>
                <ExplodedLayer k={0.85} label="Index" anchorY="30%">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="font-medium leading-[0.8] tracking-[-0.06em] text-fg/90"
                      style={{ fontSize: "clamp(4rem, 9vw, 10rem)" }}
                    >
                      {indexLabel(i)}
                    </span>
                    <div className="flex flex-col items-end gap-2 pt-1">
                      <span className="t-label">{p.period}</span>
                      {p.team && <TeamBadge />}
                    </div>
                  </div>
                </ExplodedLayer>

                <div className="space-y-[1.2vh]" style={P3}>
                  <ExplodedLayer k={0.6} label="Product" anchorY="22%">
                    <h3 className="t-h2">
                      <span className="inline-block transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-2">
                        {p.name}
                      </span>
                    </h3>
                    <p className="mt-[1.2vh] max-w-[34ch] text-[clamp(0.9rem,1.05vw,1.15rem)] leading-snug text-fg/75">
                      {p.oneLiner}
                    </p>
                  </ExplodedLayer>
                  {p.metric && (
                    <ExplodedLayer k={1} label="Output">
                      <p className="font-mono text-[clamp(0.75rem,0.9vw,0.95rem)] uppercase tracking-[0.06em] text-accent">
                        {p.metric}
                      </p>
                    </ExplodedLayer>
                  )}
                </div>

                <div className="space-y-[1.4vh]" style={P3}>
                  <ExplodedLayer k={0.45} label="Role">
                    <TagChips tags={p.tags} />
                    <p className="mt-[1.4vh] text-[0.8rem] leading-snug text-fg/60">{p.role}</p>
                  </ExplodedLayer>
                  <ExplodedLayer k={0.22} label="System">
                    <StackLine stack={p.stack} />
                    <span className="t-label mt-[1.4vh] inline-flex items-center gap-2 !text-fg">
                      Case study
                      <span className="inline-block transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1.5">
                        →
                      </span>
                    </span>
                  </ExplodedLayer>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* HUD */}
      <div className="gutter pointer-events-none absolute inset-x-0 bottom-[3svh] z-[2] flex items-center gap-6">
        <span className="t-label tabular-nums !text-fg">
          <span data-counter>01</span>
          <span className="text-muted"> / {indexLabel(n - 1)}</span>
        </span>
        <div className="relative h-px flex-1 bg-line">
          <div data-bar className="absolute inset-0 origin-left scale-x-0 bg-accent" />
        </div>
        <span className="t-label inline-flex items-center gap-2">
          <span className="size-[5px] rounded-full bg-accent" aria-hidden />
          <span data-status aria-hidden>
            Assembled
          </span>
        </span>
      </div>
    </div>
  );
}
