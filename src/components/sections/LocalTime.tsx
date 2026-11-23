"use client";

import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
};
const getSnapshot = () => fmt.format(new Date());
const getServerSnapshot = () => "--:--";

/** Live Varanasi local time, e.g. "Varanasi, IN · 14:05". */
export function LocalTime({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [h, m] = time.split(":");
  return (
    <span className={className}>
      Varanasi, IN · <time aria-label={`Local time in Varanasi ${time} IST`} className="tabular-nums">
        {h}
        <span className="animate-pulse">:</span>
        {m}
      </time>
    </span>
  );
}
