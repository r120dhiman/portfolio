"use client";

import { useEffect, useRef } from "react";

/** Elements inside a hidden <Activity> (display:none) have no client rects. */
export const isRendered = (el: Element) => el.isConnected && el.getClientRects().length > 0;

/**
 * Global components in the root layout persist across routes, and cacheComponents
 * keeps previous routes mounted-but-hidden. Re-run `scan` on route change, after
 * late content lands, and whenever the page height changes (rAF-debounced).
 */
export function useRescan(pathname: string, scan: () => void) {
  const scanRef = useRef(scan);
  useEffect(() => {
    scanRef.current = scan;
  });

  useEffect(() => {
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => scanRef.current());
    };
    run();
    const timers = [150, 700, 1800].map((t) => window.setTimeout(run, t));
    const ro = new ResizeObserver(run);
    ro.observe(document.body);
    window.addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [pathname]);
}
