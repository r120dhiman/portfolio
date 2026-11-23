import type { Project } from "@/content/projects";

/**
 * Cover for a project: the screenshot if one exists, otherwise a generated
 * poster (accent gradient + oversized name). Fills its parent; parent sets aspect ratio.
 */
export function ProjectCover({ project, className = "" }: { project: Project; className?: string }) {
  if (project.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={project.image} alt={`${project.name} screenshot`} className={`h-full w-full object-cover ${className}`} />;
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
