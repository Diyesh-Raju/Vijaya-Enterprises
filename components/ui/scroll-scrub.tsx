"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

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
  className?: string;
  as?: ElementType;
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
 * Reduced motion is left entirely alone: this never writes, and the
 * stylesheet's own media query parks the animation at its finished frame.
 */
export function ScrollScrub({
  children,
  spanMs,
  variable = "--scrub",
  className = "",
  as: Tag = "div",
}: ScrollScrubProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const write = () => {
      frame = 0;
      // How far the track can travel before its last frame is on screen.
      const distance = track.offsetHeight - window.innerHeight;
      const scrolled = -track.getBoundingClientRect().top;
      const progress =
        distance > 0 ? Math.min(Math.max(scrolled / distance, 0), 1) : 1;

      track.style.setProperty(variable, `${progress * spanMs}ms`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    write();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [spanMs, variable]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
