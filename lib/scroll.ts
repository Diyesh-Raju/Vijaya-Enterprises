"use client";

/**
 * One scroll listener and one intersection observer for the whole site.
 *
 * Every scroll-driven thing here used to bring its own: `Reveal` built an
 * `IntersectionObserver` per element — a hundred-odd of them on the longer
 * pages — and `ScrollLit`, `ScrollZoom`, `ScrollScrub`, `HandshakeReveal`,
 * the header and the hero each held their own `scroll` listener and their
 * own `requestAnimationFrame` loop. That is what the scrolling felt like:
 * six independent loops waking on the same event, each one measuring the
 * viewport for itself and each one calling `getBoundingClientRect()` on its
 * own element, so a single frame of scrolling forced layout several times
 * over instead of once.
 *
 * So: one listener, one frame, one measurement of the window, and everybody
 * reads from it. The listener does nothing but ask for a frame; all of the
 * work happens inside that frame, which is the only place a browser can do
 * it without fighting the compositor.
 *
 * Two other things keep it cheap:
 *
 *  - Nothing runs if the page has not actually moved. A scroll event fires
 *    on plenty of frames where `scrollY` is unchanged (a rubber-band at the
 *    top, a horizontal gesture, a nested scroller), and those are skipped
 *    outright rather than re-running every subscriber for the same answer.
 *
 *  - The window is measured once per frame, not once per subscriber, and its
 *    size is only re-read on `resize` — `innerHeight` is a layout read, and
 *    it is the same number for everyone anyway.
 *
 * A subscriber that is easing towards a value rather than tracking it — the
 * hero and the scrub sections both do — returns `true` to ask for another
 * frame. Only those subscribers run on that frame; the rest are left alone
 * until the page moves again.
 */

export type Viewport = {
  /** `window.scrollY`, read once for the frame. */
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/** Return `true` to be called again next frame even if the page has not moved. */
export type ScrollSubscriber = (viewport: Viewport, now: number) => boolean | void;

const subscribers = new Set<ScrollSubscriber>();
/** Those that asked, last frame, to be run again on this one. */
const settling = new Set<ScrollSubscriber>();

const viewport = { y: 0, width: 0, height: 0 };

let frame = 0;
let lastY = -1;
/** Set when everyone must run regardless of whether the page moved. */
let stale = true;
/** Set when the window's size has to be read again. */
let remeasure = true;

function schedule() {
  if (!frame) frame = requestAnimationFrame(run);
}

function onResize() {
  remeasure = true;
  stale = true;
  schedule();
}

function run(now: number) {
  frame = 0;

  const y = window.scrollY;
  const moved = y !== lastY;
  lastY = y;

  // Everyone, or only the ones still settling, or nobody at all.
  const everyone = moved || stale;
  stale = false;
  if (!everyone && settling.size === 0) return;

  viewport.y = y;
  if (remeasure) {
    remeasure = false;
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
  }

  // Copied before the pass: a subscriber may unsubscribe from inside its own
  // callback, and `settling` is refilled as we go.
  const audience = everyone ? [...subscribers] : [...settling];
  settling.clear();

  for (const fn of audience) {
    // A subscriber removed by an earlier one in this same pass is skipped.
    if (!subscribers.has(fn)) continue;
    if (fn(viewport, now) === true) settling.add(fn);
  }

  if (settling.size) schedule();
}

/**
 * Run `fn` on every frame in which the page has moved, and once immediately.
 *
 * The immediate run is synchronous so that a component can place itself
 * before the browser paints it — nothing is ever seen catching up to where
 * the page already is.
 */
export function onScroll(fn: ScrollSubscriber): () => void {
  if (subscribers.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    remeasure = true;
  }
  subscribers.add(fn);

  // This one subscriber, now, against a fresh measurement — and then the
  // shared loop for everything after.
  viewport.y = window.scrollY;
  if (remeasure) {
    remeasure = false;
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
  }
  if (fn(viewport, performance.now()) === true) {
    settling.add(fn);
    schedule();
  }

  return () => {
    subscribers.delete(fn);
    settling.delete(fn);
    if (subscribers.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cancelAnimationFrame(frame);
      frame = 0;
      lastY = -1;
      stale = true;
    }
  };
}

/**
 * Force every subscriber to run on the next frame, whether or not the page
 * has moved. For anything that changes what the answers should be without
 * touching the scroll position — a route change, or a new element arriving.
 */
export function refreshScroll() {
  stale = true;
  remeasure = true;
  lastY = -1;
  schedule();
}

/* ------------------------------------------------------------------
   The reveal observer
------------------------------------------------------------------- */

/**
 * The one threshold the whole site reveals on. Matching the reference: a
 * block counts as arrived once an eighth of it is inside a viewport whose
 * bottom edge has been pulled up a little, so a reveal fires as the block
 * clears the fold rather than the instant its first pixel appears.
 */
const RATIO = 0.12;
const FOLD = 0.1;
const ROOT_MARGIN = `0px 0px -${FOLD * 100}% 0px`;

type Watched = {
  onChange: (visible: boolean) => void;
  /** What it was last told, so nothing is written to the DOM twice. */
  visible: boolean;
  /**
   * Shown by the end-of-document guard below rather than by the observer,
   * and therefore not the observer's to take away again.
   */
  pinned: boolean;
};

const watched = new Map<Element, Watched>();
let observer: IntersectionObserver | null = null;
let stopGuard: (() => void) | null = null;
/** Whether anything is currently pinned, so the sweep can be skipped. */
let anyPinned = false;

function tell(el: Element, visible: boolean, pin = false) {
  const entry = watched.get(el);
  if (!entry) return;

  // The observer cannot un-reveal something the guard is holding open. Its
  // callbacks are delivered after the frame's animation callbacks, so
  // without this the guard would show a stranded block and the observer
  // would hide it again a moment later, every single frame.
  if (!visible && entry.pinned) return;

  if (pin) {
    entry.pinned = true;
    anyPinned = true;
  }
  if (entry.visible === visible) return;
  entry.visible = visible;
  entry.onChange(visible);
}

/**
 * The bottom of the document, where the fold offset would otherwise strand
 * things.
 *
 * Pulling the observer's bottom edge up by a tenth is what makes a reveal
 * fire as a block clears the fold instead of the instant its first pixel
 * shows. It also means that anything living permanently inside that band can
 * never fire at all — and at the very end of the document there is no scroll
 * left to lift it out. That is not a subtle degradation: the site's footer
 * sits exactly there, and its contact block and copyright line were painted
 * at `opacity: 0` for the whole life of every long page. Nobody ever saw
 * them.
 *
 * So: once the page is against its own end, anything still hidden that is
 * genuinely on screen is shown. The sweep is skipped entirely until then —
 * one property read per frame — and it also covers a page too short to
 * scroll at all, where every reveal is inside the band from the start.
 */
function guard({ y, height }: Viewport) {
  const atEnd = y + height >= document.documentElement.scrollHeight - 2;

  if (!atEnd) {
    // Off the end again: hand everything back to the observer, which will
    // re-arm whatever has genuinely left the screen on its next delivery.
    if (anyPinned) {
      anyPinned = false;
      for (const entry of watched.values()) entry.pinned = false;
    }
    return;
  }

  for (const [el] of watched) {
    const box = el.getBoundingClientRect();
    if (box.height > 0 && box.bottom > 0 && box.top < height) {
      tell(el, true, true);
    }
  }
}

function ensureObserver() {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // A block taller than the viewport can never reach `RATIO` of itself
        // on screen, so treat "any of it is showing" as enough.
        const rootHeight = entry.rootBounds?.height ?? window.innerHeight ?? 0;
        const tall = entry.boundingClientRect.height >= rootHeight * 0.75;

        if (entry.isIntersecting && (entry.intersectionRatio >= RATIO || tall)) {
          tell(entry.target, true);
        } else if (entry.intersectionRatio === 0) {
          // Only once it is completely gone. Re-arming while it is still
          // half on screen is what makes a reveal flicker.
          tell(entry.target, false);
        }
      }
    },
    { threshold: [0, RATIO], rootMargin: ROOT_MARGIN },
  );
  return observer;
}

/**
 * Watch one element with the shared observer.
 *
 * `onChange` is called only when the answer actually changes, so a caller can
 * write straight to the DOM without checking first.
 *
 * Returns `false` if there is no observer to watch with, so the caller can
 * fall back to showing its content outright rather than leaving it hidden.
 */
export function observeReveal(
  el: Element,
  onChange: (visible: boolean) => void,
): (() => void) | false {
  const io = ensureObserver();
  if (!io) return false;

  watched.set(el, { onChange, visible: false, pinned: false });
  io.observe(el);
  if (!stopGuard) stopGuard = onScroll(guard);
  // The guard only sweeps what was registered when it last ran, so a page
  // that cannot scroll at all — where it runs once, on subscribe, and then
  // never again — would only ever rescue whichever reveal happened to
  // register first. Asking for a fresh pass covers every element that
  // mounts afterwards; the request is coalesced, so a page mounting a
  // hundred of them still costs one frame.
  refreshScroll();

  return () => {
    io.unobserve(el);
    watched.delete(el);
    if (watched.size === 0 && stopGuard) {
      stopGuard();
      stopGuard = null;
    }
  };
}

/** Whether the reader has asked for less movement. Checked in a lot of places. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
