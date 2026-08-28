"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type ScrollScrubProps = {
  children: ReactNode;
  /**
   * The length of the timeline being scrubbed. Progress through the track is
   * written out as a time in this span, so the animations it drives can be
   * ordinary keyframes with ordinary delays.
   */
  spanMs: number;
  /** The custom property to write the time into. */
  variable?: string;
  /**
   * Seconds for the written time to catch up with where the page actually
   * is. Zero — the default — writes the scroll position straight through,
   * so every animation it drives stops dead the instant the scrolling
   * does. Anything above it lets the sequence keep gliding into place for
   * a moment afterwards, which is what stops a phase handing over to the
   * next one from reading as a jump. Around 0.3 is a long enough tail to
   * feel like weight and short enough not to feel like lag.
   */
  ease?: number;
  className?: string;
  as?: ElementType;
  /** For the custom properties the track's own geometry is written in. */
  style?: CSSProperties;
};

/**
 * Turns how far an element has been scrolled through into a CSS time.
 *
 * The animations it drives are declared normally in the stylesheet — name,
 * duration, delay, easing — and simply held with `animation-play-state:
 * paused`. Each one's delay is `calc(<its start> - var(--the-variable))`, so
 * writing a time here scrubs every animation to that moment at once. All of
 * the choreography stays in CSS; this only says what o'clock it is.
 *
 * Deliberately not a scroll-timeline: `animation-timeline: scroll()` would do
 * this natively and with no JavaScript, but it is not in every engine yet and
 * a hero that does not run is not a hero.
 *
 * Writes are coalesced to one per frame, and the value goes straight onto the
 * node rather than through React state — a scrub changes every frame, and
 * re-rendering the tree to move one number would be pure waste.
 *
 * With `ease` set, the value chases the scroll position rather than being it,
 * and the frame loop keeps running until it has caught up. That tail is the
 * difference between a sequence that moves and one that is dragged: the
 * animation carries on settling for a moment after the wheel stops, and a
 * phase handing over to the next one is a hand-over rather than a jump.
 *
 * Reduced motion is left entirely alone: this never writes, and the
 * stylesheet's own media query parks the animation at its finished frame.
 */
export function ScrollScrub({
  children,
  spanMs,
  variable = "--scrub",
  className = "",
  as: Tag = "div",
  style,
  ease = 0,
}: ScrollScrubProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    // When the last frame ran, and the value actually on the node — which
    // is only the same as `read()` once the tail has caught up.
    let last = 0;
    let written: number | null = null;

    /** Where the page is: how far the track has been scrolled through. */
    const read = () => {
      // How far the track can travel before its last frame is on screen.
      const distance = track.offsetHeight - window.innerHeight;
      const scrolled = -track.getBoundingClientRect().top;
      return distance > 0 ? Math.min(Math.max(scrolled / distance, 0), 1) : 1;
    };

    const put = (progress: number) => {
      track.style.setProperty(variable, `${progress * spanMs}ms`);
    };

    const tick = (now: number) => {
      frame = 0;
      const target = read();
      // Capped, so a frame dropped or a tab left in the background does
      // not arrive as one enormous step.
      const elapsed = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      if (written === null || ease <= 0) {
        // The first write of all, and every write when nothing was asked
        // for: straight through, so the section is never seen catching up
        // to where the page already is.
        written = target;
      } else {
        // Exponential catch-up, worked out from the time that actually
        // passed rather than per frame, so the tail is the same length on
        // a 60Hz screen as on a 120Hz one.
        written += (target - written) * (1 - Math.exp(-elapsed / ease));
      }

      put(written);

      // Keep going while there is still ground to make up. A twentieth of
      // a percent is under half a scrub unit on the longest sequence here,
      // which is less than one frame of it.
      if (Math.abs(target - written) > 0.0002) {
        frame = requestAnimationFrame(tick);
      } else {
        written = target;
        put(written);
        last = 0;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick(0);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [spanMs, variable, ease]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
