"use client";

/**
 * The site's own smooth scroll, for every click that moves the page within
 * itself — a logo or Home link that goes back to the top, a button that
 * goes down to a section.
 *
 * Not `scroll-behavior: smooth`. The browser's version is built to get out
 * of the way: it leaves at full speed and spends the rest of its time
 * settling, so from the foot of the home page it covers eleven of its
 * twelve thousand pixels in under half a second, and the page does not so
 * much glide to the top as vanish to it. This one eases in as well as out
 * and takes its time — about three seconds across a whole page — so the
 * reader can watch the sections go by and knows where they have been taken.
 *
 * The duration grows with the square root of the distance rather than with
 * the distance itself: a section away is about two seconds, a whole page
 * about three, and a very long page is still capped, so nobody waits on a
 * scroll they asked for.
 *
 * It stops the moment the reader takes over — a wheel, a touch, a click or
 * a key — rather than dragging the page against them. And a reader who has
 * asked their system for less motion gets the jump: unlike the home hero,
 * which only ever moves as far as the reader scrolls it, this is a page
 * moving on its own, which is exactly what that setting is for.
 */

const BASE_MS = 700;
/** Per square root of a pixel: ~3s from the foot of the home page. */
const PER_ROOT_PX_MS = 21;
const MAX_MS = 3600;

/** Slow away, quick through the middle, slow to rest. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Anything the reader does that means they have taken the page back. */
const TAKEOVER = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

let cancelCurrent: (() => void) | null = null;

/** Scroll the window to `top`, gliding. A new glide replaces one under way. */
export function glideTo(top: number) {
  cancelCurrent?.();

  const root = document.documentElement;
  const start = window.scrollY;
  const end = Math.min(Math.max(top, 0), Math.max(root.scrollHeight - window.innerHeight, 0));
  const distance = end - start;
  if (Math.abs(distance) < 1) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: end, behavior: "instant" });
    return;
  }

  const duration = Math.min(MAX_MS, BASE_MS + Math.sqrt(Math.abs(distance)) * PER_ROOT_PX_MS);
  let frame = 0;
  let began = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of TAKEOVER) window.removeEventListener(type, stop, true);
    if (cancelCurrent === stop) cancelCurrent = null;
  };

  const step = (now: number) => {
    if (!began) began = now;
    const t = Math.min((now - began) / duration, 1);
    // `instant` on every step, or the stylesheet's `scroll-behavior: smooth`
    // would turn each one into a little native glide of its own, chasing
    // the next.
    window.scrollTo({ top: start + distance * easeInOutCubic(t), behavior: "instant" });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };

  for (const type of TAKEOVER) {
    window.addEventListener(type, stop, { capture: true, passive: true });
  }
  cancelCurrent = stop;
  frame = requestAnimationFrame(step);
}

/**
 * Where the browser would land `target` if it scrolled there itself —
 * `scroll-padding-top` for the fixed bar, the element's own
 * `scroll-margin-top`, clamping at either end of the page, all of it.
 *
 * Found by asking: jump there, read the offset, jump back. Both happen in
 * the same task, so nothing is painted in between and nothing is seen to
 * move; the scroll event it queues finds the page where it started.
 */
export function landingFor(target: Element) {
  const from = window.scrollY;
  target.scrollIntoView({ block: "start", behavior: "instant" });
  const to = window.scrollY;
  window.scrollTo({ top: from, behavior: "instant" });
  return to;
}
