"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. Returns `serverValue` during SSR and hydration,
 * then the live value — no hydration mismatch.
 */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}

/** Large pointer-driven screens with motion allowed: where the cinematic versions run. */
export const CINEMATIC_QUERY =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
