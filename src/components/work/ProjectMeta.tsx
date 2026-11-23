import clsx from "clsx";
import type { Project, RoleTag } from "@/content/projects";

/** Role chips (AI / Systems / Shipped / Customer). Recruiters scan these. */
export function TagChips({ tags, className }: { tags: RoleTag[]; className?: string }) {
  return (
    <ul className={clsx("flex flex-wrap gap-1.5", className)} aria-label="Role tags">
      {tags.map((t) => (
        <li
          key={t}
          className="inline-flex items-center gap-1.5 rounded-full border border-fg/20 px-2.5 py-1 font-mono text-[0.68rem] uppercase leading-none tracking-[0.08em] text-fg"
        >
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}

export function TeamBadge({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-fg/10 px-2 py-1 font-mono text-[0.62rem] uppercase leading-none tracking-[0.08em] text-fg/80",
        className
      )}
    >
      Team project
    </span>
  );
}

export function StackLine({ stack, className }: { stack: string[]; className?: string }) {
  return <p className={clsx("font-mono text-[0.7rem] leading-relaxed text-muted", className)}>{stack.join(" · ")}</p>;
}

export const indexLabel = (i: number) => String(i + 1).padStart(2, "0");

/** Last 4-digit year in a period string, e.g. "Mar – Dec 2025" → "2025". */
export const yearOf = (p: Project) => p.period.match(/\d{4}/g)?.at(-1) ?? p.period;

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
