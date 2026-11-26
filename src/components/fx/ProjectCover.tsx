import Image from "next/image";
import type { Project } from "@/content/projects";

/** Every screenshot in /public/shots is exported at this size. */
const SHOT_W = 1600;
const SHOT_H = 1000;

type Props = {
  project: Project;
  className?: string;
  /**
   * Responsive width hint. Defaults to full-viewport; pass the real layout width wherever
   * the cover is smaller (a 2-up grid, a preview thumbnail) so Next serves a smaller file.
   */
  sizes?: string;
  /** Set on the one cover that is the LCP element for its route. */
  priority?: boolean;
};

/**
 * Cover for a project: the screenshot if one exists, otherwise a generated
 * poster (accent gradient + oversized name). Fills its parent; parent sets aspect ratio.
 */
export function ProjectCover({ project, className = "", sizes = "100vw", priority = false }: Props) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={project.imageAlt ?? `Screenshot of ${project.name}: ${project.oneLiner}`}
        width={SHOT_W}
        height={SHOT_H}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, ${project.accent}cc 0%, ${project.accent}33 38%, #0b0b0a 75%)`,
      }}
    >
      <span
        className="absolute bottom-[-0.12em] left-[-0.04em] font-medium leading-none tracking-[-0.06em] text-[#0b0b0a]/80 mix-blend-overlay"
        style={{ fontSize: "clamp(4rem, 14vw, 12rem)" }}
        aria-hidden
      >
        {project.name}
      </span>
      <span className="t-label absolute left-4 top-4 !text-white/70">{project.stack.slice(0, 3).join(" · ")}</span>
    </div>
  );
}
