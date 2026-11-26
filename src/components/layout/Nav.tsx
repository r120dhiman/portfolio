"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "@/components/fx/SmoothScroll";
import { HashLink, useHashScroll } from "@/components/sections/HashLink";
import { RollText } from "@/components/sections/RollText";
import { LocalTime } from "@/components/sections/LocalTime";
import { ScrambleText } from "@/components/tech/ScrambleText";
import { nav, site } from "@/content/site";

const focusRing =
  "rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export function Nav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const scrollTo = useHashScroll();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const openRef = useRef(false);

  // Hide on scroll down, show on scroll up.
  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;
    let hidden = false;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const shouldHide = !openRef.current && self.direction === 1 && self.scroll() > 120;
        if (shouldHide === hidden) return;
        hidden = shouldHide;
        gsap.to(header, {
          yPercent: hidden ? -110 : 0,
          duration: prefersReducedMotion() ? 0 : 0.6,
          ease: "expo.out",
          overwrite: true,
        });
      },
    });
    return () => st.kill();
  });

  // Overlay menu timeline (built once).
  useGSAP(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const links = overlay.querySelectorAll("[data-menu-link]");
    const meta = overlay.querySelectorAll("[data-menu-meta]");
    tlRef.current = gsap
      .timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set(overlay, { visibility: "hidden" });
        },
      })
      .set(overlay, { visibility: "visible" })
      .fromTo(
        overlay,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: "expo.inOut" }
      )
      .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.07, ease: "expo.out" }, "-=0.4")
      .fromTo(meta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" }, "-=0.7");
    return () => {
      tlRef.current = null;
    };
  });

  // Drive the timeline + scroll lock from state.
  useEffect(() => {
    openRef.current = open;
    const tl = tlRef.current;
    if (!tl) return;
    const reduced = prefersReducedMotion();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "clip";
      if (headerRef.current) gsap.set(headerRef.current, { yPercent: 0 });
      if (reduced) tl.progress(1).pause();
      else tl.timeScale(1).play();
      firstLinkRef.current?.focus({ preventScroll: true });
    } else {
      lenis?.start();
      document.documentElement.style.removeProperty("overflow");
      if (tl.progress() === 0) return;
      if (reduced) {
        tl.progress(0).pause();
        if (overlayRef.current) gsap.set(overlayRef.current, { visibility: "hidden" });
      } else tl.timeScale(1.6).reverse();
    }
  }, [open, lenis]);

  // Escape closes; leaving mobile breakpoint closes; Tab is trapped inside the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const root = overlayRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === first || !root.contains(activeEl))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const onWordmark = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.4, force: true });
      else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  };

  const closeMenuAndGo = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    setOpen(false);
    lenis?.start();
    if (scrollTo(href)) e.preventDefault();
  };

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          const main = document.getElementById("main");
          if (!main) return;
          e.preventDefault();
          // Focus it without leaving tabindex behind, so <main> never joins the tab order.
          main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: true });
          main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
          main.scrollIntoView();
        }}
        className="fixed left-4 top-4 z-[80] -translate-y-24 bg-fg px-3 py-2 font-mono text-xs uppercase tracking-wider text-bg focus:translate-y-0"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        className="gutter pointer-events-none fixed inset-x-0 top-0 z-50 text-white mix-blend-difference will-change-transform [view-transition-name:site-header]"
      >
        <div className="flex items-center justify-between gap-6 py-5 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            onClick={onWordmark}
            aria-label={`${site.name}, home`}
            data-cursor-label="Home"
            className={`tech-glitch group pointer-events-auto text-[15px] font-medium tracking-tight ${focusRing}`}
          >
            <RollText>{site.name}</RollText>
          </Link>

          <nav aria-label="Primary" className="pointer-events-auto hidden md:block">
            <ul className="flex items-center gap-8 font-mono text-xs uppercase tracking-[0.08em]">
              {nav.map((item) => (
                <li key={item.href}>
                  <HashLink
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`group inline-flex ${focusRing}`}
                  >
                    <ScrambleText inView={false} hover hoverTarget="a" duration={0.5}>
                      <RollText>{item.label}</RollText>
                    </ScrambleText>
                  </HashLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pointer-events-auto flex items-center justify-end gap-6">
            <LocalTime className="hidden font-mono text-xs uppercase tracking-[0.08em] sm:inline" />
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls={menuId}
              className={`group font-mono text-xs uppercase tracking-[0.08em] md:hidden ${focusRing}`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="flex flex-col gap-[3px]" aria-hidden>
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                </span>
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        style={{ visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" }}
        className="gutter fixed inset-0 z-[58] flex flex-col bg-bg-2 text-fg md:hidden"
        data-lenis-prevent
      >
        <div className="flex items-center justify-between py-5">
          <span className="text-[15px] font-medium tracking-tight">{site.name}</span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              menuBtnRef.current?.focus();
            }}
            className={`font-mono text-xs uppercase tracking-[0.08em] ${focusRing}`}
          >
            Close
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-[8vh] flex-1">
          <ul className="border-t border-line">
            {nav.map((item, i) => (
              <li key={item.href} className="overflow-hidden border-b border-line">
                <HashLink
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={closeMenuAndGo(item.href)}
                  className={`flex items-baseline justify-between py-3 ${focusRing}`}
                >
                  <span data-menu-link className="block text-[clamp(2.75rem,14vw,5rem)] font-medium leading-[0.95] tracking-[-0.045em]">
                    {i % 2 === 1 ? <span className="t-serif">{item.label}</span> : item.label}
                  </span>
                  <span data-menu-meta className="t-label">
                    0{i + 1}
                  </span>
                </HashLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 pb-8 pt-6">
          <a data-menu-meta href={site.links.email} className={`text-lg tracking-tight ${focusRing}`}>
            {site.email}
          </a>
          <div data-menu-meta className="t-label flex flex-wrap items-center justify-between gap-3">
            <span className="flex gap-5">
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className={focusRing}>
                GitHub ↗
              </a>
              <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className={focusRing}>
                LinkedIn ↗
              </a>
            </span>
            <LocalTime />
          </div>
        </div>
      </div>
    </>
  );
}
