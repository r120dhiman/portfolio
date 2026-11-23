"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, type ComponentProps, type MouseEvent } from "react";
import { useLenis } from "@/components/fx/SmoothScroll";
import { prefersReducedMotion } from "@/lib/gsap";

/** Returns a handler that smooth-scrolls to "/#id" hrefs when already on "/". Returns true when handled. */
export function useHashScroll() {
  const pathname = usePathname();
  const lenis = useLenis();
  return useCallback(
    (href: string) => {
      if (pathname !== "/" || !href.startsWith("/#")) return false;
      const hash = href.slice(1);
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return false;
      if (lenis) lenis.scrollTo(el, { duration: 1.4, force: true });
      else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      history.replaceState(null, "", hash);
      return true;
    },
    [pathname, lenis]
  );
}

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string; onAfterClick?: () => void };

/** next/link that smooth-scrolls with Lenis for same-page hash links. */
export function HashLink({ href, onClick, onAfterClick, ...rest }: Props) {
  const scrollTo = useHashScroll();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
      onAfterClick?.();
      return;
    }
    onAfterClick?.();
    if (scrollTo(href)) e.preventDefault();
  };
  return <Link href={href} onClick={handle} {...rest} />;
}
