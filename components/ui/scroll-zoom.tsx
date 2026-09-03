"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";

type ScrollZoomProps = {
  children: ReactNode;
  className?: string;
  /**
   * How far in the photograph starts, as a share of its own size. It is a
   * crop, not a movement: the frame keeps its exact box and the picture
   * inside it opens out to fill it.
   */
  amount?: number;
  /** Where the frame's top edge starts the settle, as a share of the screen. */
  from?: number;
  /** Where it finishes, as a share of the screen. */
  to?: number;
};

/**
 * A photograph that opens out of a slight crop as the page scrolls it up.
 *
 * The frame never moves. Only the picture inside it does — it arrives held a
 * little too close, and by the time the frame is properly on screen it has
 * eased back to its true size and stays there. Scrubbed rather than played,
 * so it is the reader's own scrolling that settles the picture rather than a
 * canned animation that runs once it is tripped.
 *
 * Progress is written into `--settle` on this element and the picture works
 * out its own scale from it in CSS — see `.scroll-zoom` in `globals.css`. So
 * a frame of scrolling is one custom property write, and nothing here
 * re-renders: the value goes straight onto the node, like `ScrollLit`.
 *
 * Settled unless this says otherwise: the stylesheet only applies the scale
 * under `data-zoom="on"`, which is set once the effect runs and only for a
 * reader who has not asked for less motion. No JavaScript and reduced motion
 * both land on the plain photograph rather than one left cropped in.
 */
export function ScrollZoom({
  children,
  className,
  amount = 0.14,
  from = 0.94,
  to = 0.45,
}: ScrollZoomProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) return;

    // The attribute first, so that the very first pass — which `onScroll`
    // runs synchronously — writes a position the scale is already reading.
    // The browser therefore never gets a frame where the scale applies but
    // the position it was worked out from has not been written yet.
    el.dataset.zoom = "on";

    const stop = onScroll(({ height }) => {
      const box = el.getBoundingClientRect();
      const start = height * from;
      const run = start - height * to;
      const progress = run > 0 ? (start - box.top) / run : 1;
      el.style.setProperty("--settle", `${Math.min(Math.max(progress, 0), 1)}`);
    });

    return () => {
      stop();
      delete el.dataset.zoom;
    };
  }, [from, to]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ "--zoom-in": amount } as CSSProperties}
    >
      {children}
    </div>
  );
}
