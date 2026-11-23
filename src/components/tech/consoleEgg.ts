let printed = false;

const ART = String.raw`
 ____   ___  _   _ ___ _____   _  ___   _ __  __    _    ____
|  _ \ / _ \| | | |_ _|_   _| | |/ / | | |  \/  |  / \  |  _ \
| |_) | | | | |_| || |  | |   | ' /| | | | |\/| | / _ \ | |_) |
|  _ <| |_| |  _  || |  | |   | . \| |_| | |  | |/ ___ \|  _ <
|_| \_\\___/|_| |_|___| |_|   |_|\_\\___/|_|  |_/_/   \_\_| \_\
`;

/** Styled devtools greeting. Prints once per page load. */
export function printConsoleEgg() {
  if (printed || typeof window === "undefined") return;
  printed = true;
  const mono = "font-family:ui-monospace,SFMono-Regular,Menlo,monospace;";
  console.log(`%c${ART}`, `${mono}color:#ff5a1f;font-size:11px;line-height:1.15;`);
  console.log(
    "%cHiring for SDE / AI / FDE?%c  contact@rohitkumar.info",
    `${mono}color:#ecebe6;font-size:12px;`,
    `${mono}color:#ff5a1f;font-size:12px;`
  );
  console.log("%cNext.js · GSAP · Lenis · WebGL — press G on the page for the layout grid.", `${mono}color:#8d8b84;font-size:11px;`);
}
