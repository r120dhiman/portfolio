/**
 * Tiny text "decoder": cycles each character of an element's text nodes through
 * mono glyphs, then resolves left → right to the real text.
 *
 * It mutates the *existing* text nodes' `nodeValue` (the very nodes React owns)
 * instead of replacing innerHTML, so React reconciliation is never broken. If
 * React updates a node mid-animation, that node is released untouched.
 *
 * (We deliberately don't use GSAP's ScrambleTextPlugin: it rewrites innerHTML,
 * which detaches React-managed text nodes.)
 */

export const GLYPHS = "01#%/<>_*+=:".split("");

const running = new WeakMap<Element, () => void>();

type Item = { node: Text; final: string; out: string[]; last: string; offset: number; live: boolean };

const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/** Scramble `el`'s text and resolve it. Returns a cancel fn that restores the text. */
export function scramble(el: Element, { duration = 0.7 }: { duration?: number } = {}) {
  running.get(el)?.();

  const items: Item[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let total = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const final = node.nodeValue ?? "";
    if (!final.trim()) continue;
    items.push({ node, final, out: final.split(""), last: final, offset: total, live: true });
    total += final.length;
  }
  if (!total) return () => {};

  // Each char resolves at a staggered time: mostly left → right, with jitter.
  const reveal = new Float32Array(total);
  for (let i = 0; i < total; i++) reveal[i] = (i / total) * duration * 0.55 + Math.random() * duration * 0.45;

  const t0 = performance.now();
  let lastSwap = 0;
  let raf = 0;

  const finish = () => {
    cancelAnimationFrame(raf);
    for (const it of items) {
      if (it.live && it.node.nodeValue === it.last) it.node.nodeValue = it.final;
    }
    running.delete(el);
  };

  const frame = (now: number) => {
    const t = (now - t0) / 1000;
    const swap = now - lastSwap > 50;
    if (swap) lastSwap = now;

    for (const it of items) {
      if (!it.live) continue;
      // React (or anyone) changed this node: let go of it.
      if (it.node.nodeValue !== it.last) {
        it.live = false;
        continue;
      }
      for (let j = 0; j < it.final.length; j++) {
        const c = it.final[j];
        if (c === " " || t >= reveal[it.offset + j]) it.out[j] = c;
        else if (swap || it.out[j] === c) it.out[j] = randomGlyph();
      }
      const next = it.out.join("");
      if (next !== it.last) {
        it.node.nodeValue = next;
        it.last = next;
      }
    }

    if (t < duration) raf = requestAnimationFrame(frame);
    else finish();
  };

  raf = requestAnimationFrame(frame);
  running.set(el, finish);
  return finish;
}
