import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

/** Max separation (px) a layer with depth k = 1 travels toward the viewer when fully exploded. */
export const SPREAD = 300;
/** Resting separation (px) at k = 1, so cursor tilt reads as real depth even when assembled. */
export const REST = 10;
/** Cursor parallax (px) at k = 1: base + extra while exploded. */
export const PAR_BASE = 6;
export const PAR_EXPLODED = 22;

export const P3: CSSProperties = { transformStyle: "preserve-3d" };

const zCalc = (k: number) => `calc(${k} * (var(--e, 0) * ${SPREAD}px + ${REST}px))`;
const parCalc = (k: number, axis: "--mx" | "--my") =>
  `calc(var(${axis}, 0) * ${k} * (${PAR_BASE}px + ${PAR_EXPLODED}px * var(--e, 0)))`;

/** CSS transform for a layer of depth k — mirrored in JS for the WebGL cover. */
export const layerTransform = (k: number) => `translate3d(${parCalc(k, "--mx")}, ${parCalc(k, "--my")}, ${zCalc(k)})`;

type Side = "left" | "right";

/**
 * One plane of an exploded panel. Driven entirely by CSS variables set on the
 * panel (`--e` explode 0..1, `--v` visibility 0..1) and the stage (`--mx`, `--my`).
 * Renders: the content, a dashed footprint on the base plate, a depth connector
 * running back to the base plate, and a mono callout label.
 */
export function ExplodedLayer({
  k,
  label,
  side = "right",
  anchorY = "50%",
  className,
  contentClassName,
  contentStyle,
  children,
  ...rest
}: {
  k: number;
  label: string;
  side?: Side;
  anchorY?: string;
  className?: string;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  children: ReactNode;
} & Record<`data-${string}`, string | boolean | undefined>) {
  const anchor: CSSProperties = side === "right" ? { left: "100%", top: anchorY } : { right: "100%", top: anchorY };
  return (
    <div {...rest} className={clsx("relative", className)} style={{ ...P3, transform: layerTransform(k) }}>
      <div className={contentClassName} style={{ opacity: "var(--v, 1)", ...contentStyle }}>
        {children}
      </div>

      {/* Footprint: where this layer sits on the base plate. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[3px] border border-dashed border-fg/20"
        style={{
          transform: `translateZ(calc(-1 * ${zCalc(k)}))`,
          opacity: "calc(var(--v, 1) * min(1, var(--e, 0) * 1.6) * 0.9)",
        }}
      />

      {/* Depth connector back to the base plate (a line running along -Z). */}
      <span
        aria-hidden
        className="pointer-events-none absolute h-px origin-left"
        style={{
          ...(side === "right" ? { left: "100%" } : { left: 0 }),
          top: anchorY,
          width: `${Math.round(k * SPREAD)}px`,
          transform: "rotateY(90deg) scaleX(var(--e, 0))",
          backgroundImage: "linear-gradient(90deg, var(--accent) 55%, transparent 55%)",
          backgroundSize: "7px 1px",
          opacity: "calc(var(--v, 1) * min(1, var(--e, 0) * 2) * 0.75)",
        }}
      />

      {/* Callout */}
      <span
        aria-hidden
        className={clsx(
          "pointer-events-none absolute flex -translate-y-1/2 items-center whitespace-nowrap",
          side === "left" && "flex-row-reverse"
        )}
        style={{ ...anchor, opacity: "calc(var(--v, 1) * min(1, max(0, var(--e, 0) * 2.4 - 0.25)))" }}
      >
        <span className={clsx("size-[5px] shrink-0 rounded-full bg-accent", side === "right" ? "-ml-[2.5px]" : "-mr-[2.5px]")} />
        <span className="h-px w-[clamp(18px,2.2vw,40px)] bg-fg/25" />
        <span className={clsx("font-mono text-[10px] uppercase leading-none tracking-[0.14em] text-fg/45", side === "right" ? "ml-2" : "mr-2")}>
          {label}
          <span className="ml-2 normal-case text-fg/25">z+{String(Math.round(k * SPREAD)).padStart(3, "0")}</span>
        </span>
      </span>
    </div>
  );
}
