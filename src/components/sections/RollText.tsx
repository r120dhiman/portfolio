import clsx from "clsx";

/**
 * Text that rolls up to a duplicate on hover/focus of the nearest `.group` ancestor.
 * The duplicate is aria-hidden, so screen readers read it once.
 */
export function RollText({ children, className }: { children: string; className?: string }) {
  const t = "transition-transform duration-500 [transition-timing-function:var(--ease-out)]";
  return (
    <span className={clsx("relative inline-flex overflow-hidden align-bottom", className)}>
      <span className={clsx("block", t, "group-hover:-translate-y-full group-focus-visible:-translate-y-full")}>
        {children}
      </span>
      <span
        aria-hidden
        className={clsx("absolute inset-0 block translate-y-full", t, "group-hover:translate-y-0 group-focus-visible:translate-y-0")}
      >
        {children}
      </span>
    </span>
  );
}
