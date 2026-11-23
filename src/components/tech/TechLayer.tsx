"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/components/work/useMediaQuery";
import { HeadingScan } from "./HeadingScan";
import { ScrollHud } from "./ScrollHud";
import { GridOverlay, Viewfinder } from "./Viewfinder";
import { printConsoleEgg } from "./consoleEgg";

const HUD_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/** Site-wide "engineer's HUD". Mounted once in the root layout; all overlays are pointer-events: none. */
export function TechLayer() {
  const pathname = usePathname();
  const desktop = useMediaQuery(HUD_QUERY);
  const [grid, setGrid] = useState(false);

  useEffect(() => printConsoleEgg(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "g" && e.key !== "G") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || isTyping(e.target)) return;
      setGrid((g) => !g);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <HeadingScan pathname={pathname} />
      <GridOverlay on={grid} />
      {desktop ? (
        <>
          <ScrollHud pathname={pathname} />
          <Viewfinder grid={grid} />
        </>
      ) : null}
    </>
  );
}
