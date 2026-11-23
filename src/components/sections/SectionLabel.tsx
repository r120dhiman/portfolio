import clsx from "clsx";
import { ScrambleText } from "@/components/tech/ScrambleText";

/** Mono eyebrow row: "— Label ........ aside" with a hairline. Text decodes through glyphs on enter / hover. */
export function SectionLabel({ children, aside, className }: { children: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("t-label flex items-center gap-4 border-t border-line pt-4", className)}>
      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      <ScrambleText hover>{children}</ScrambleText>
      {aside ? (
        <ScrambleText className="ml-auto text-right" duration={0.9}>
          {aside}
        </ScrambleText>
      ) : null}
    </div>
  );
}
